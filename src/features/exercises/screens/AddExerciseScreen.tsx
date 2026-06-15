import { useVirtualizer } from "@tanstack/react-virtual";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Dumbbell,
  Plus,
  Search,
  Timer,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import type {
  ExerciseLibraryItem,
} from "../../../app/db/models/exercise-library.model";
import {
  EXERCISE_TIME_UNITS,
  EXERCISE_TYPES,
  EXERCISE_WEIGHT_UNITS,
  type ExerciseType,
  type ExerciseUnit,
  type WorkoutDay,
} from "../../../app/db/models/exercise.model";
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
import { DEFAULT_MUSCLE_TAGS } from "../../../shared/constants/muscleTags";
import { WEEKDAYS } from "../../../shared/constants/weekdays";
import {
  Button,
  EmptyState,
  Field,
  PageShell,
  Panel,
  RowCard,
  SegmentedControl,
  SelectField,
  TextField,
  cn,
} from "../../../shared/ui";

interface IExerciseSetupState {
  exerciseType: ExerciseType;
  exerciseUnit: ExerciseUnit;
  plannedSetCount: string;
  muscleTags: string[];
  customTag: string;
}

type TAllFilter = "all";
type TExerciseTypeFilter = ExerciseType | TAllFilter;

const ALL_FILTER_VALUE = "all" as const;
const RESULT_STEP = 50;

const defaultSetupState: IExerciseSetupState = {
  exerciseType: "reps",
  exerciseUnit: "kg",
  plannedSetCount: "3",
  muscleTags: [],
  customTag: "",
};

const exerciseTypeOptions = EXERCISE_TYPES.map((value) => ({
  label: value,
  value,
}));

const exerciseTypeFilterOptions: Array<{
  label: string;
  value: TExerciseTypeFilter;
}> = [
  { label: "All", value: ALL_FILTER_VALUE },
  ...EXERCISE_TYPES.map((value) => ({ label: value, value })),
];

const categoryFilterOptions = [
  ALL_FILTER_VALUE,
  ...DEFAULT_MUSCLE_TAGS,
  "Other",
] as const;

export default function AddExerciseScreen() {
  const { day } = useParams<{ day: WorkoutDay }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_FILTER_VALUE);
  const [exerciseTypeFilter, setExerciseTypeFilter] =
    useState<TExerciseTypeFilter>(ALL_FILTER_VALUE);
  const [resultLimit, setResultLimit] = useState(RESULT_STEP);
  const [seedReady, setSeedReady] = useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [setupState, setSetupState] =
    useState<IExerciseSetupState>(defaultSetupState);

  const isValidDay = day != null && WEEKDAYS.includes(day);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    let mounted = true;

    async function seedBuiltInExercises() {
      const { exerciseLibrary } = await import("../data/exerciseLibrary");
      await seedExerciseLibrary(exerciseLibrary);

      if (mounted) {
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
    [
      seedReady,
      searchQuery,
      categoryFilter,
      exerciseTypeFilter,
      resultLimit,
    ],
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
  const resultListRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns measurement callbacks by design.
  const rowVirtualizer = useVirtualizer({
    count: visibleExercises.length,
    estimateSize: (index) =>
      visibleExercises[index]?.id === expandedExerciseId ? 540 : 190,
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
      eyebrow="Add exercise"
      title={day}
      description="Search the exercise library, filter by muscle group, then confirm how you want to track it."
      actions={
        <Button
          tone="secondary"
          leadingIcon={<ArrowLeft size={16} />}
          onClick={() => navigate("/days/" + day)}
        >
          Back
        </Button>
      }
    >
      <Panel className="space-y-4 p-4 sm:p-5">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)"
            size={18}
          />
          <TextField
            aria-label="Search exercises"
            className="pl-11"
            placeholder="Search exercise name"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Muscle group" htmlFor="exercise-category-filter">
            <SelectField
              id="exercise-category-filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              {categoryFilterOptions.map((category) => (
                <option key={category} value={category} className="bg-slate-950 text-white">
                  {category === ALL_FILTER_VALUE ? "All muscle groups" : category}
                </option>
              ))}
            </SelectField>
          </Field>
          <Field label="Type">
            <SegmentedControl
              options={exerciseTypeFilterOptions}
              value={exerciseTypeFilter}
              onChange={setExerciseTypeFilter}
            />
          </Field>
        </div>
      </Panel>

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
            className="motion-list max-h-[70vh] overflow-auto pr-1 [scrollbar-gutter:stable]"
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
              onClick={() => setResultLimit((currentLimit) => currentLimit + RESULT_STEP)}
            >
              Show more results
            </Button>
          )}
        </>
      )}
    </PageShell>
  );
}

function ExercisePickerCard({
  exercise,
  expanded,
  setupState,
  setSetupState,
  onToggle,
  onSave,
}: {
  exercise: ExerciseLibraryItem;
  expanded: boolean;
  setupState: IExerciseSetupState;
  setSetupState: (nextState: IExerciseSetupState) => void;
  onToggle: () => void;
  onSave: () => void;
}) {
  const isRepsExercise = setupState.exerciseType === "reps";
  const displayUnits = isRepsExercise
    ? EXERCISE_WEIGHT_UNITS
    : EXERCISE_TIME_UNITS;
  const cardExerciseType = expanded ? setupState.exerciseType : exercise.exerciseType;
  const cardExerciseUnit = expanded ? setupState.exerciseUnit : exercise.exerciseUnit;
  const cardSetCount = expanded ? setupState.plannedSetCount : "3";
  const cardMuscleTags = expanded
    ? setupState.muscleTags
    : (exercise.muscleTags ?? []);

  return (
    <Panel className="overflow-hidden [content-visibility:auto] [contain-intrinsic-size:180px]">
      <button
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition duration-200 hover:bg-white/4 sm:px-5"
        type="button"
        onClick={onToggle}
      >
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-black/10",
              exercise.exerciseType === "reps"
                ? "border-sky-400/25 text-sky-100"
                : "border-amber-400/25 text-amber-100",
            )}
          >
            {exercise.exerciseType === "reps" ? (
              <Dumbbell size={20} />
            ) : (
              <Timer size={20} />
            )}
          </div>
          <div className="min-w-0 space-y-2">
            <div>
              <h2 className="truncate text-base font-semibold text-(--text-strong)">
                {exercise.title}
              </h2>
              {!exercise.isBuiltIn && (
                <p className="mt-1 text-xs text-(--text-muted)">Custom exercise</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
                  Config
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <ConfigChip>{cardExerciseType}</ConfigChip>
                  <ConfigChip>{cardExerciseUnit}</ConfigChip>
                  <ConfigChip>{cardSetCount || "0"} sets</ConfigChip>
                </div>
              </div>

              {cardMuscleTags.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
                    Muscle tags
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {cardMuscleTags.slice(0, 4).map((tag) => (
                      <MuscleTagPill key={tag}>{tag}</MuscleTagPill>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-(--surface-border) bg-white/4 text-(--text-soft) transition-transform duration-300",
            expanded && "rotate-180",
          )}
        >
          <ChevronDown size={18} />
        </span>
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-(--surface-border) px-4 pb-4 pt-4 sm:px-5">
            <Field
              label="Muscle tags"
              hint="Choose all muscles this exercise trains. Add a custom tag when needed."
            >
              <MuscleTagSelector
                selectedTags={setupState.muscleTags}
                customTag={setupState.customTag}
                setCustomTag={(customTag) =>
                  setSetupState({ ...setupState, customTag })
                }
                onToggleTag={(tag) =>
                  setSetupState({
                    ...setupState,
                    muscleTags: toggleTag(setupState.muscleTags, tag),
                  })
                }
                onAddCustomTag={() => {
                  const normalizedTag = setupState.customTag.trim();

                  if (!normalizedTag) {
                    return;
                  }

                  setSetupState({
                    ...setupState,
                    customTag: "",
                    muscleTags: addUniqueTag(setupState.muscleTags, normalizedTag),
                  });
                }}
              />
            </Field>

            <Field label="Tracking type">
              <SegmentedControl
                options={exerciseTypeOptions}
                value={setupState.exerciseType}
                onChange={(nextType) =>
                  setSetupState({
                    ...setupState,
                    exerciseType: nextType,
                    exerciseUnit: nextType === "reps" ? "kg" : "sec",
                  })
                }
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Unit" htmlFor={`unit-${exercise.id}`}>
                <SelectField
                  id={`unit-${exercise.id}`}
                  value={setupState.exerciseUnit}
                  onChange={(event) =>
                    setSetupState({
                      ...setupState,
                      exerciseUnit: event.target.value as ExerciseUnit,
                    })
                  }
                >
                  {displayUnits.map((unit) => (
                    <option key={unit} value={unit} className="bg-slate-950 text-white">
                      {unit}
                    </option>
                  ))}
                </SelectField>
              </Field>

              <Field label="Starting sets" htmlFor={`sets-${exercise.id}`}>
                <TextField
                  id={`sets-${exercise.id}`}
                  type="number"
                  min="0"
                  max="12"
                  step="1"
                  inputMode="numeric"
                  value={setupState.plannedSetCount}
                  onChange={(event) =>
                    setSetupState({
                      ...setupState,
                      plannedSetCount: event.target.value,
                    })
                  }
                />
              </Field>
            </div>

            <Button
              tone="primary"
              fullWidth
              leadingIcon={<Check size={16} />}
              onClick={onSave}
            >
              Add to workout
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ConfigChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-(--surface-border) bg-black/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-soft)">
      {children}
    </span>
  );
}

function MuscleTagPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-100">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
      {children}
    </span>
  );
}

function MuscleTagSelector({
  selectedTags,
  customTag,
  setCustomTag,
  onToggleTag,
  onAddCustomTag,
}: {
  selectedTags: string[];
  customTag: string;
  setCustomTag: (customTag: string) => void;
  onToggleTag: (tag: string) => void;
  onAddCustomTag: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {DEFAULT_MUSCLE_TAGS.map((tag) => {
          const selected = selectedTags.includes(tag);

          return (
            <button
              key={tag}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggleTag(tag)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200",
                selected
                  ? "border-transparent bg-(--accent) text-(--accent-ink)"
                  : "border-(--surface-border) bg-white/4 text-(--text-soft) hover:border-(--surface-border-strong) hover:bg-white/8",
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <TextField
          aria-label="Custom muscle tag"
          placeholder="Add custom tag"
          value={customTag}
          onChange={(event) => setCustomTag(event.target.value)}
        />
        <Button
          tone="secondary"
          leadingIcon={<Plus size={16} />}
          onClick={onAddCustomTag}
          disabled={!customTag.trim()}
        >
          Add tag
        </Button>
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <MuscleTagPill key={tag}>{tag}</MuscleTagPill>
          ))}
        </div>
      )}
    </div>
  );
}

function toggleTag(tags: string[], tag: string) {
  return tags.includes(tag)
    ? tags.filter((currentTag) => currentTag !== tag)
    : [...tags, tag];
}

function addUniqueTag(tags: string[], tag: string) {
  return tags.some(
    (currentTag) => currentTag.toLowerCase() === tag.toLowerCase(),
  )
    ? tags
    : [...tags, tag];
}

function buildSetupState(exercise: ExerciseLibraryItem): IExerciseSetupState {
  return {
    exerciseType: exercise.exerciseType,
    exerciseUnit: exercise.exerciseUnit,
    plannedSetCount: "3",
    muscleTags: exercise.muscleTags ?? [],
    customTag: "",
  };
}
