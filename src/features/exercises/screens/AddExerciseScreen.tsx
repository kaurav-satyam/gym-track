import {
  ArrowLeft,
  Check,
  ChevronDown,
  Dumbbell,
  Plus,
  Search,
  Timer,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  createExerciseTemplate,
  type CreateExercisePayload,
} from "../../../app/db/repositories/exercise.repository";
import {
  EXERCISE_TIME_UNITS,
  EXERCISE_TYPES,
  EXERCISE_WEIGHT_UNITS,
  type ExerciseType,
  type ExerciseUnit,
  type WorkoutDay,
} from "../../../app/db/models/exercise.model";
import {
  Badge,
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
import { WEEKDAYS } from "../../../shared/constants/weekdays";
import {
  exerciseLibrary,
  type ExerciseLibraryItem,
} from "../data/exerciseLibrary";

interface IExerciseSetupState {
  exerciseType: ExerciseType;
  exerciseUnit: ExerciseUnit;
  plannedDurationMin: string;
  plannedSetCount: string;
}

const exerciseTypeOptions = EXERCISE_TYPES.map((value) => ({
  label: value,
  value,
}));

export default function AddExerciseScreen() {
  const { day } = useParams<{ day: WorkoutDay }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [customExercises, setCustomExercises] = useState<ExerciseLibraryItem[]>([]);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [setupState, setSetupState] = useState<IExerciseSetupState>(
    buildSetupState(exerciseLibrary[0]),
  );

  const isValidDay = day != null && WEEKDAYS.includes(day);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const allExercises = useMemo(
    () => [...customExercises, ...exerciseLibrary],
    [customExercises],
  );
  const visibleExercises = useMemo(() => {
    if (!normalizedQuery) {
      return allExercises;
    }

    return allExercises.filter((exercise) =>
      exercise.title.toLowerCase().includes(normalizedQuery),
    );
  }, [allExercises, normalizedQuery]);
  const exactExerciseExists = allExercises.some(
    (exercise) => exercise.title.toLowerCase() === normalizedQuery,
  );
  const canCreateCustomExercise = normalizedQuery.length > 0 && !exactExerciseExists;

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

  function handleCreateCustomExercise() {
    const title = searchQuery.trim();

    if (!title) {
      return;
    }

    const customExercise: ExerciseLibraryItem = {
      id: `custom-${crypto.randomUUID()}`,
      title,
      exerciseType: "reps",
      exerciseUnit: "kg",
      plannedDurationMin: 10,
    };

    setCustomExercises((currentExercises) => [customExercise, ...currentExercises]);
    setExpandedExerciseId(customExercise.id);
    setSetupState(buildSetupState(customExercise));
  }

  async function handleSaveExercise(exercise: ExerciseLibraryItem) {
    const plannedSetCount = Math.max(
      0,
      Math.min(12, Math.round(Number(setupState.plannedSetCount) || 0)),
    );
    const plannedDurationMin =
      setupState.plannedDurationMin === ""
        ? undefined
        : Number(setupState.plannedDurationMin);
    const payload: CreateExercisePayload = {
      title: exercise.title,
      day: day!,
      exerciseType: setupState.exerciseType,
      exerciseUnit: setupState.exerciseUnit,
      plannedDurationMin,
      exerciseSets: Array.from({ length: plannedSetCount }, () => ({
        id: crypto.randomUUID(),
      })),
    };

    await createExerciseTemplate(payload);
    navigate("/days/" + day);
  }

  return (
    <PageShell
      eyebrow="Add exercise"
      title={day}
      description="Search the exercise library, pick a movement, then confirm how you want to track it."
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
      <Panel className="p-4 sm:p-5">
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
      </Panel>

      {canCreateCustomExercise && (
        <RowCard className="flex items-center justify-between gap-3 p-3 sm:p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-(--text-strong)">
              Create "{searchQuery.trim()}"
            </p>
            <p className="mt-1 text-xs text-(--text-muted)">
              Add it as a custom card, then choose tracking metadata.
            </p>
          </div>
          <Button
            tone="primary"
            leadingIcon={<Plus size={16} />}
            onClick={handleCreateCustomExercise}
          >
            Add
          </Button>
        </RowCard>
      )}

      {visibleExercises.length === 0 ? (
        <EmptyState
          title="No matches"
          description="Use the add action above to create this as a custom exercise."
        />
      ) : (
        <div className="motion-list space-y-3">
          {visibleExercises.map((exercise) => (
            <ExercisePickerCard
              key={exercise.id}
              exercise={exercise}
              expanded={expandedExerciseId === exercise.id}
              setupState={setupState}
              setSetupState={setSetupState}
              onToggle={() => expandExercise(exercise)}
              onSave={() => void handleSaveExercise(exercise)}
            />
          ))}
        </div>
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

  return (
    <Panel className="overflow-hidden">
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
            <h2 className="truncate text-base font-semibold text-(--text-strong)">
              {exercise.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="soft">{exercise.exerciseType}</Badge>
              <Badge tone="soft">{exercise.exerciseUnit}</Badge>
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

            <div className="grid gap-4 sm:grid-cols-3">
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

              <Field label="Duration" htmlFor={`duration-${exercise.id}`}>
                <TextField
                  id={`duration-${exercise.id}`}
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={setupState.plannedDurationMin}
                  onChange={(event) =>
                    setSetupState({
                      ...setupState,
                      plannedDurationMin: event.target.value,
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

function buildSetupState(exercise: ExerciseLibraryItem): IExerciseSetupState {
  return {
    exerciseType: exercise.exerciseType,
    exerciseUnit: exercise.exerciseUnit,
    plannedDurationMin: String(exercise.plannedDurationMin ?? ""),
    plannedSetCount: "3",
  };
}
