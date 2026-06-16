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
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
import { loadDefaultMuscleTags } from "../../../shared/constants/muscleTags";
import { WEEKDAYS } from "../../../shared/constants/weekdays";
import {
  Button,
  IconButton,
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

export default function AddExerciseScreen() {
  const { day } = useParams<{ day: WorkoutDay }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_FILTER_VALUE);
  const [exerciseTypeFilter, setExerciseTypeFilter] =
    useState<TExerciseTypeFilter>(ALL_FILTER_VALUE);
  const [resultLimit, setResultLimit] = useState(RESULT_STEP);
  const [seedReady, setSeedReady] = useState(false);
  const [defaultMuscleTags, setDefaultMuscleTags] = useState<string[]>([]);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [setupState, setSetupState] =
    useState<IExerciseSetupState>(defaultSetupState);

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
    <PageShell className="max-w-4xl py-3 sm:py-6" contentClassName="space-y-3 sm:space-y-4">
      <div className="sticky top-0 z-30 -mx-4 border-b border-(--surface-border) bg-(--app-bg-start)/95 px-4 pb-2 pt-1.5 backdrop-blur-xl sm:top-3 sm:mx-0 sm:rounded-[26px] sm:border sm:bg-(--surface-panel) sm:p-2.5 sm:shadow-[var(--shadow-panel)]">
        <div className="flex items-center gap-2">
          <IconButton
            tone="secondary"
            size="sm"
            aria-label="Back to workout day"
            title="Back"
            onClick={() => navigate("/days/" + day)}
          >
            <ArrowLeft size={17} />
          </IconButton>

          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)"
              size={18}
            />
            <TextField
              aria-label="Search exercises"
              className="h-10 rounded-xl py-2 pl-10 text-sm"
              placeholder="Search exercise"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setResultLimit(RESULT_STEP);
                setExpandedExerciseId(null);
              }}
            />
          </div>
        </div>

        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <SearchableMuscleGroupSelect
            id="exercise-category-filter"
            options={categoryFilterOptions}
            value={categoryFilter}
            onChange={(nextCategory) => {
              setCategoryFilter(nextCategory);
              setResultLimit(RESULT_STEP);
              setExpandedExerciseId(null);
            }}
          />
          <TypeFilterSelect
            value={exerciseTypeFilter}
            onChange={(nextType) => {
              setExerciseTypeFilter(nextType);
              setResultLimit(RESULT_STEP);
              setExpandedExerciseId(null);
            }}
          />
        </div>
      </div>

      <div className="flex min-h-9 items-center justify-between gap-2 rounded-xl border border-(--surface-border) bg-(--surface-control) px-3 py-1.5 text-xs text-(--text-soft)">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="font-medium text-(--text-strong)">{resultSummary}</span>
          {categoryFilter !== ALL_FILTER_VALUE && (
            <FilterPill>{getMuscleOptionLabel(categoryFilter)}</FilterPill>
          )}
          {exerciseTypeFilter !== ALL_FILTER_VALUE && (
            <FilterPill>{exerciseTypeFilter}</FilterPill>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-(--text-soft) transition hover:text-(--text-strong)"
            onClick={clearFilters}
          >
            <X size={13} />
            Clear
          </button>
        )}
      </div>

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
  defaultMuscleTags,
  onToggle,
  onSave,
}: {
  exercise: ExerciseLibraryItem;
  expanded: boolean;
  setupState: IExerciseSetupState;
  setSetupState: (nextState: IExerciseSetupState) => void;
  defaultMuscleTags: string[];
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
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition duration-200 hover:bg-(--surface-control) sm:px-4"
        type="button"
        onClick={onToggle}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-(--surface-inset)",
              exercise.exerciseType === "reps"
                ? "border-(--type-reps-border) text-(--type-reps-text)"
                : "border-(--type-time-border) text-(--type-time-text)",
            )}
          >
            {exercise.exerciseType === "reps" ? (
              <Dumbbell size={17} />
            ) : (
              <Timer size={17} />
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate text-sm font-semibold text-(--text-strong) sm:text-base">
                {exercise.title}
              </h2>
              {!exercise.isBuiltIn && (
                <span className="shrink-0 rounded-full border border-(--surface-border) px-2 py-0.5 text-[10px] font-medium text-(--text-muted)">
                  Custom
                </span>
              )}
            </div>

            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-muted)">
              {cardExerciseType} · {cardExerciseUnit} · {cardSetCount || "0"} sets
            </p>

            <p className="truncate text-xs text-(--tag-text)">
              {cardMuscleTags.length > 0
                ? cardMuscleTags.join(" · ")
                : "No muscle tags"}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-(--surface-border) bg-(--surface-control) text-(--text-soft) transition-transform duration-300",
            expanded && "rotate-180",
          )}
        >
          <ChevronDown size={16} />
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
                availableTags={defaultMuscleTags}
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

                  const existingTag = defaultMuscleTags.find(
                    (tag) => tag.toLowerCase() === normalizedTag.toLowerCase(),
                  );

                  setSetupState({
                    ...setupState,
                    customTag: "",
                    muscleTags: addUniqueTag(
                      setupState.muscleTags,
                      existingTag ?? normalizedTag,
                    ),
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

function TypeFilterSelect({
  value,
  onChange,
}: {
  value: TExerciseTypeFilter;
  onChange: (value: TExerciseTypeFilter) => void;
}) {
  return (
    <div className="relative">
      <SelectField
        aria-label="Exercise type filter"
        className="h-10 rounded-xl py-2 pl-3 pr-8 text-xs font-medium capitalize"
        value={value}
        onChange={(event) => onChange(event.target.value as TExerciseTypeFilter)}
      >
        {exerciseTypeFilterOptions.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-950 text-white">
            {option.label === "All" ? "All types" : option.label}
          </option>
        ))}
      </SelectField>
    </div>
  );
}


function SearchableMuscleGroupSelect({
  id,
  options,
  value,
  onChange,
}: {
  id: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedLabel = getMuscleOptionLabel(value);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = options.filter((option) =>
    getMuscleOptionLabel(option).toLowerCase().includes(normalizedQuery),
  );

  function selectOption(nextValue: string) {
    onChange(nextValue);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <TextField
          id={id}
          aria-expanded={open}
          aria-haspopup="listbox"
          autoComplete="off"
          className="h-10 rounded-xl py-2 pr-9 text-xs font-medium"
          placeholder={selectedLabel}
          value={open ? query : selectedLabel}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
        />
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) transition-transform duration-200",
            open && "rotate-180",
          )}
          size={17}
        />
      </div>

      {open && (
        <div
          className="max-h-64 overflow-auto rounded-xl border border-(--surface-border) bg-(--surface-panel) p-1 shadow-[var(--shadow-row)] scrollbar-gutter-stable"
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <p className="px-3 py-2 text-sm text-(--text-muted)">No muscle group found.</p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-(--surface-control-hover)",
                  option === value
                    ? "bg-(--surface-active) font-medium text-(--text-strong)"
                    : "text-(--text-soft)",
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
                role="option"
                aria-selected={option === value}
              >
                {getMuscleOptionLabel(option)}
                {option === value && <Check size={14} />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function FilterPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-(--accent-border) bg-(--accent-soft) px-2 py-0.5 text-[11px] font-medium capitalize text-(--text-strong)">
      {children}
    </span>
  );
}

function MuscleTagPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-(--tag-border) bg-(--tag-bg) px-2.5 py-1 text-xs font-medium text-(--tag-text)">
      <span className="h-1.5 w-1.5 rounded-full bg-(--success)" />
      {children}
    </span>
  );
}

function MuscleTagSelector({
  availableTags,
  selectedTags,
  customTag,
  setCustomTag,
  onToggleTag,
  onAddCustomTag,
}: {
  availableTags: string[];
  selectedTags: string[];
  customTag: string;
  setCustomTag: (customTag: string) => void;
  onToggleTag: (tag: string) => void;
  onAddCustomTag: () => void;
}) {
  const normalizedSearch = customTag.trim().toLowerCase();
  const visibleTags = availableTags.filter((tag) =>
    tag.toLowerCase().includes(normalizedSearch),
  );

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <TextField
          aria-label="Search or add muscle tag"
          placeholder="Search or add muscle tag"
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

      {visibleTags.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-(--surface-border) p-3 text-sm text-(--text-muted)">
          No default tag matches. Add it as a custom tag.
        </p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-gutter-stable">
          {visibleTags.map((tag) => {
            const selected = selectedTags.includes(tag);

            return (
            <button
              key={tag}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggleTag(tag)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200",
                selected
                  ? "border-transparent bg-(--accent) text-(--accent-ink)"
                  : "border-(--surface-border) bg-(--surface-control) text-(--text-soft) hover:border-(--surface-border-strong) hover:bg-(--surface-control-hover)",
              )}
            >
              {tag}
            </button>
            );
          })}
        </div>
      )}

      {selectedTags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-gutter-stable">
          {selectedTags.map((tag) => (
            <MuscleTagPill key={tag}>{tag}</MuscleTagPill>
          ))}
        </div>
      )}
    </div>
  );
}


function createMuscleFilterOptions(tags: string[]) {
  return [ALL_FILTER_VALUE, ...tags, "Other"].filter(
    (tag, index, options) => options.indexOf(tag) === index,
  );
}

function getMuscleOptionLabel(option: string) {
  return option === ALL_FILTER_VALUE ? "All muscle groups" : option;
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
