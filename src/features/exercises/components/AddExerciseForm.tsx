import { ChevronDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";
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
  Button,
  Field,
  Panel,
  SegmentedControl,
  SelectField,
  TextField,
  cn,
} from "../../../shared/ui";

interface IAddExerciseFormProps {
  readonly day: WorkoutDay;
  isOpen: boolean;
  setIsOpen: (arg: boolean) => void;
}

const exerciseTypeOptions: Array<{ label: string; value: ExerciseType }> =
  EXERCISE_TYPES.map((value) => ({
    label: value,
    value,
  }));

export default function AddExerciseForm({
  day,
  isOpen,
  setIsOpen,
}: IAddExerciseFormProps) {
  const [title, setTitle] = useState("");
  const [exerciseType, setExerciseType] = useState<ExerciseType>("reps");
  const [exerciseUnit, setExerciseUnit] = useState<ExerciseUnit>("kg");
  const [plannedDurationMin, setPlannedDurationMin] = useState("");
  const [plannedSetCount, setPlannedSetCount] = useState("3");

  const displayUnits = useMemo(
    () =>
      exerciseType === "reps" ? EXERCISE_WEIGHT_UNITS : EXERCISE_TIME_UNITS,
    [exerciseType],
  );

  async function handleAddExercise() {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      return;
    }

    const nextPlannedDuration =
      plannedDurationMin === "" ? undefined : Number(plannedDurationMin);

    const normalizedSetCount = Math.max(
      0,
      Math.min(12, Math.round(Number(plannedSetCount) || 0)),
    );

    const payload: CreateExercisePayload = {
      title: normalizedTitle,
      day,
      exerciseType,
      exerciseUnit,
      plannedDurationMin: nextPlannedDuration,
      exerciseSets: Array.from({ length: normalizedSetCount }, () => ({
        id: crypto.randomUUID(),
      })),
    };

    await createExerciseTemplate(payload);

    setTitle("");
    setExerciseType("reps");
    setExerciseUnit("kg");
    setPlannedDurationMin("");
    setPlannedSetCount("3");
    setIsOpen(false);
  }

  return (
    <Panel className="overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition duration-200 hover:bg-white/3 sm:px-6"
      >
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-(--text-muted)">
            Add exercise
          </p>
          <h2 className="text-2xl font-semibold text-(--text-strong)">
            Quick setup
          </h2>
        </div>

        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl border border-(--surface-border) bg-white/4 text-(--text-soft) transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        >
          <ChevronDown size={18} />
        </div>
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <form
            className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6"
            onSubmit={(event) => {
              event.preventDefault();
              void handleAddExercise();
            }}
          >
            <Field label="Exercise name" htmlFor="exercise-name">
              <TextField
                id="exercise-name"
                type="text"
                placeholder="Bench press"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </Field>

            <Field
              label="Exercise type"
              hint="Choose whether this movement is tracked by reps or by time."
            >
              <SegmentedControl
                options={exerciseTypeOptions}
                value={exerciseType}
                onChange={(value) => {
                  setExerciseType(value);
                  setExerciseUnit(value === "reps" ? "kg" : "sec");
                }}
              />
            </Field>

            <Field label="Unit" htmlFor="exercise-unit">
              <SelectField
                id="exercise-unit"
                value={exerciseUnit}
                onChange={(event) =>
                  setExerciseUnit(event.target.value as ExerciseUnit)
                }
              >
                {displayUnits.map((unit) => (
                  <option
                    key={unit}
                    value={unit}
                    className="bg-slate-950 text-white"
                  >
                    {unit}
                  </option>
                ))}
              </SelectField>
            </Field>

            <Field
              label="Planned duration"
              htmlFor="exercise-duration"
              hint="Shown on the home screen as the estimated time for this exercise."
            >
              <TextField
                id="exercise-duration"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="15"
                value={plannedDurationMin}
                onChange={(event) => setPlannedDurationMin(event.target.value)}
              />
            </Field>

            <Field
              label="Starting sets"
              htmlFor="exercise-sets"
              hint="Creates empty set rows so you can capture the workout immediately."
            >
              <TextField
                id="exercise-sets"
                type="number"
                min="0"
                max="12"
                step="1"
                inputMode="numeric"
                placeholder="3"
                value={plannedSetCount}
                onChange={(event) => setPlannedSetCount(event.target.value)}
              />
            </Field>

            <Button
              type="submit"
              tone="primary"
              fullWidth
              leadingIcon={<Plus size={16} />}
              disabled={!title.trim()}
            >
              Create exercise
            </Button>
          </form>
        </div>
      </div>
    </Panel>
  );
}
