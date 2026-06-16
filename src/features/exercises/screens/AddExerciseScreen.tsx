import { useVirtualizer } from "@tanstack/react-virtual";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type {
  ExerciseLibraryItem,
} from "../../../app/db/models/exercise-library.model";
import { type WorkoutDay } from "../../../app/db/models/exercise.model";
import {
  createCustomExerciseLibraryItem,
  getExerciseLibraryItemByTitle,
  listExerciseLibraryItems,
  seedExerciseLibrary,
  updateExerciseLibraryItemDefaults,
} from "../../../app/db/repositories/exercise-library.repository";
import {
  createExerciseTemplate,
  type CreateExercisePayload,
} from "../../../app/db/repositories/exercise.repository";
import { loadDefaultMuscleTags } from "../../../shared/constants/muscleTags";
import { WEEKDAYS } from "../../../shared/constants/weekdays";
import { Button, EmptyState, PageShell, RowCard } from "../../../shared/ui";
import {
  ALL_FILTER_VALUE,
  AddExerciseResultSummary,
  AddExerciseToolbar,
  ExercisePickerCard,
  RESULT_STEP,
  buildSetupState,
  createMuscleFilterOptions,
  defaultSetupState,
  type ExerciseSetupState,
  type ExerciseTypeFilter,
} from "../components/AddExercise";

export default function AddExerciseScreen() {
  const { day } = useParams<{ day: WorkoutDay }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_FILTER_VALUE);
  const [exerciseTypeFilter, setExerciseTypeFilter] =
    useState<ExerciseTypeFilter>(ALL_FILTER_VALUE);
  const [resultLimit, setResultLimit] = useState(RESULT_STEP);
  const [seedReady, setSeedReady] = useState(false);
  const [defaultMuscleTags, setDefaultMuscleTags] = useState<string[]>([]);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(
    null,
  );
  const [setupState, setSetupState] =
    useState<ExerciseSetupState>(defaultSetupState);

  const isValidDay = day != null && WEEKDAYS.includes(day);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const categoryFilterOptions = useMemo(
    () => createMuscleFilterOptions(defaultMuscleTags),
    [defaultMuscleTags],
  );

  useEffect(() => {
    let mounted = true;

    async function seedBuiltInExercises() {
      const { loadExerciseLibrary } = await import("../data/exerciseLibrary");
      const [exerciseLibrary, muscleTags] = await Promise.all([
        loadExerciseLibrary(),
        loadDefaultMuscleTags(),
      ]);

      await seedExerciseLibrary(exerciseLibrary);

      if (mounted) {
        setDefaultMuscleTags(muscleTags);
        setSeedReady(true);
      }
    }

    void seedBuiltInExercises();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleExercises = useLiveQuery(
    () => {
      if (!seedReady) {
        return [];
      }

      return listExerciseLibraryItems({
        query: searchQuery,
        category: categoryFilter,
        exerciseType: exerciseTypeFilter,
        limit: resultLimit,
      });
    },
    [seedReady, searchQuery, categoryFilter, exerciseTypeFilter, resultLimit],
    [],
  );

  const exactExercise = useLiveQuery(
    () => {
      if (!seedReady || !normalizedQuery) {
        return undefined;
      }

      return getExerciseLibraryItemByTitle(searchQuery);
    },
    [seedReady, normalizedQuery, searchQuery],
  );

  const canCreateCustomExercise = normalizedQuery.length > 0 && !exactExercise;
  const shouldShowMore = visibleExercises.length >= resultLimit;
  const hasActiveFilters =
    normalizedQuery.length > 0 ||
    categoryFilter !== ALL_FILTER_VALUE ||
    exerciseTypeFilter !== ALL_FILTER_VALUE;
  const resultSummary = seedReady
    ? `${visibleExercises.length} exercise${visibleExercises.length === 1 ? "" : "s"} shown`
    : "Preparing library";
  const resultListRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns measurement callbacks by design.
  const rowVirtualizer = useVirtualizer({
    count: visibleExercises.length,
    estimateSize: (index) =>
      visibleExercises[index]?.id === expandedExerciseId ? 520 : 92,
    getScrollElement: () => resultListRef.current,
    overscan: 8,
  });

  if (!isValidDay) {
    return (
      <PageShell title="Add exercise">
        <EmptyState
          title="Invalid day"
          description="Open a workout day first, then add an exercise from there."
        />
      </PageShell>
    );
  }

  function resetResultWindow() {
    setResultLimit(RESULT_STEP);
    setExpandedExerciseId(null);
  }

  function handleSearchQueryChange(value: string) {
    setSearchQuery(value);
    resetResultWindow();
  }

  function handleCategoryFilterChange(value: string) {
    setCategoryFilter(value);
    resetResultWindow();
  }

  function handleExerciseTypeFilterChange(value: ExerciseTypeFilter) {
    setExerciseTypeFilter(value);
    resetResultWindow();
  }

  function expandExercise(exercise: ExerciseLibraryItem) {
    const isAlreadyExpanded = expandedExerciseId === exercise.id;

    setExpandedExerciseId(isAlreadyExpanded ? null : exercise.id);

    if (!isAlreadyExpanded) {
      setSetupState(buildSetupState(exercise));
    }
  }

  async function handleCreateCustomExercise() {
    const title = searchQuery.trim();

    if (!title) {
      return;
    }

    const customExercise = await createCustomExerciseLibraryItem({
      title,
      exerciseType: "reps",
      exerciseUnit: "kg",
      muscleTags: [],
      category: categoryFilter === ALL_FILTER_VALUE ? "Other" : categoryFilter,
    });

    setExpandedExerciseId(customExercise.id);
    setSetupState(buildSetupState(customExercise));
  }

  function clearFilters() {
    setSearchQuery("");
    setCategoryFilter(ALL_FILTER_VALUE);
    setExerciseTypeFilter(ALL_FILTER_VALUE);
    setExpandedExerciseId(null);
    setResultLimit(RESULT_STEP);
  }

  async function handleSaveExercise(exercise: ExerciseLibraryItem) {
    const plannedSetCount = Math.max(
      0,
      Math.min(12, Math.round(Number(setupState.plannedSetCount) || 0)),
    );
    const payload: CreateExercisePayload = {
      title: exercise.title,
      day: day!,
      exerciseType: setupState.exerciseType,
      exerciseUnit: setupState.exerciseUnit,
      muscleTags: setupState.muscleTags,
      exerciseSets: Array.from({ length: plannedSetCount }, () => ({
        id: crypto.randomUUID(),
      })),
    };

    if (!exercise.isBuiltIn) {
      await updateExerciseLibraryItemDefaults(exercise.id, {
        exerciseType: setupState.exerciseType,
        exerciseUnit: setupState.exerciseUnit,
        muscleTags: setupState.muscleTags,
        category: setupState.muscleTags[0] ?? exercise.category,
      });
    }

    await createExerciseTemplate(payload);
    navigate("/days/" + day);
  }

  return (
    <PageShell
      className="max-w-4xl py-3 sm:py-6"
      contentClassName="space-y-3 sm:space-y-4"
    >
      <AddExerciseToolbar
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        categoryFilterOptions={categoryFilterOptions}
        exerciseTypeFilter={exerciseTypeFilter}
        onBack={() => navigate("/days/" + day)}
        onSearchQueryChange={handleSearchQueryChange}
        onCategoryFilterChange={handleCategoryFilterChange}
        onExerciseTypeFilterChange={handleExerciseTypeFilterChange}
      />

      <AddExerciseResultSummary
        resultSummary={resultSummary}
        categoryFilter={categoryFilter}
        exerciseTypeFilter={exerciseTypeFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {canCreateCustomExercise && (
        <RowCard className="flex items-center justify-between gap-3 p-3 sm:p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-(--text-strong)">
              Create "{searchQuery.trim()}"
            </p>
            <p className="mt-1 text-xs text-(--text-muted)">
              Persist it in your library, then choose tracking metadata.
            </p>
          </div>
          <Button
            tone="primary"
            leadingIcon={<Plus size={16} />}
            onClick={() => void handleCreateCustomExercise()}
          >
            Add
          </Button>
        </RowCard>
      )}

      {!seedReady ? (
        <EmptyState
          title="Loading library"
          description="Preparing your exercise library on this device."
        />
      ) : visibleExercises.length === 0 ? (
        <EmptyState
          title="No matches"
          description="Change the filters or use the add action above to create a custom exercise."
        />
      ) : (
        <>
          <div
            ref={resultListRef}
            className="motion-list relative z-0 h-[calc(100dvh-13.25rem)] min-h-[18rem] overflow-auto pr-1 scrollbar-gutter-stable sm:h-auto sm:max-h-[70vh]"
          >
            <div
              className="relative w-full"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const exercise = visibleExercises[virtualRow.index];

                if (!exercise) {
                  return null;
                }

                return (
                  <div
                    key={virtualRow.key}
                    ref={rowVirtualizer.measureElement}
                    className="absolute left-0 top-0 w-full pb-3"
                    data-index={virtualRow.index}
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                  >
                    <ExercisePickerCard
                      exercise={exercise}
                      expanded={expandedExerciseId === exercise.id}
                      setupState={setupState}
                      setSetupState={setSetupState}
                      defaultMuscleTags={defaultMuscleTags}
                      onToggle={() => expandExercise(exercise)}
                      onSave={() => void handleSaveExercise(exercise)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {shouldShowMore && (
            <Button
              tone="secondary"
              fullWidth
              onClick={() =>
                setResultLimit((currentLimit) => currentLimit + RESULT_STEP)
              }
            >
              Show more results
            </Button>
          )}
        </>
      )}
    </PageShell>
  );
}
