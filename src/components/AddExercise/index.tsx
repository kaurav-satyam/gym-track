import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import {
  createExercise,
  type ICreateExercisePayload,
} from "../../app/db/repositories/exercise.repository";
import {
  ExerciseTimeUnits,
  ExerciseTypes,
  ExerciseWeightUnits,
  type TDay,
  type TExerciseType,
  type TExerciseUnitType,
} from "../../app/db/table/exercise.table";
import {
  Button,
  Field,
  Panel,
  SegmentedControl,
  SelectField,
  TextField,
  cn,
} from "../ui";

interface IAddExerciseProps {
  readonly day: TDay;
  isOpen: boolean;
  setIsOpen: (arg: boolean) => void;
}

const exerciseTypeOptions: Array<{ label: string; value: TExerciseType }> =
  ExerciseTypes.map((value) => ({
    label: value,
    value,
  }));

export default function AddExercise({
  day,
  isOpen,
  setIsOpen,
}: IAddExerciseProps) {
  const [title, setTitle] = useState("");
  const [exerciseType, setExerciseType] = useState<TExerciseType>("reps");
  const [exerciseUnit, setExerciseUnit] = useState<TExerciseUnitType>("kg");
  const [plannedDurationMin, setPlannedDurationMin] = useState("");

  const displayUnits = useMemo(
    () => (exerciseType === "reps" ? ExerciseWeightUnits : ExerciseTimeUnits),
    [exerciseType],
  );

  async function addExercise() {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      return;
    }

    const nextPlannedDuration =
      plannedDurationMin === "" ? undefined : Number(plannedDurationMin);

    const data: ICreateExercisePayload = {
      title: normalizedTitle,
      day,
      exerciseType,
      exerciseUnit,
      plannedDurationMin: nextPlannedDuration,
      exerciseSets: [],
    };

    await createExercise(data);

    setTitle("");
    setExerciseType("reps");
    setExerciseUnit("kg");
    setPlannedDurationMin("");
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
            {day}
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
            onSubmit={(e) => {
              e.preventDefault();
              void addExercise();
            }}
          >
            <Field label="Exercise name" htmlFor="exercise-name">
              <TextField
                id="exercise-name"
                type="text"
                placeholder="Bench press"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                onChange={(e) =>
                  setExerciseUnit(e.target.value as TExerciseUnitType)
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
                onChange={(e) => setPlannedDurationMin(e.target.value)}
              />
            </Field>

            <Button type="submit" tone="primary" fullWidth>
              Save exercise
            </Button>
          </form>
        </div>
      </div>
    </Panel>
  );
}
