import type {
  ExerciseSet,
  ExerciseType,
  ExerciseUnit,
} from "@/domain/models/exercise";

export type SetField = "weight" | "reps" | "time";

/** Step used by the +/- buttons for each field and unit. */
export function getStep(field: SetField, unit: ExerciseUnit) {
  if (field === "reps") {
    return 1;
  }

  const steps: Record<ExerciseUnit, number> = {
    kg: 2.5,
    lb: 5,
    sec: 5,
    min: 1,
    hr: 0.25,
  };

  return steps[unit];
}

export function formatNumber(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "–";
  }

  // Avoid float noise like 42.49999 after repeated steps.
  return String(Math.round(value * 100) / 100);
}

/** "40 kg × 10" for reps exercises, "90 sec" for time exercises. */
export function formatSetValues(
  values: Pick<ExerciseSet, SetField>,
  exerciseType: ExerciseType,
  unit: ExerciseUnit,
) {
  if (exerciseType === "time") {
    return `${formatNumber(values.time)} ${unit}`;
  }

  return `${formatNumber(values.weight)} ${unit} × ${formatNumber(values.reps)}`;
}

export function fieldsFor(exerciseType: ExerciseType): SetField[] {
  return exerciseType === "time" ? ["time"] : ["weight", "reps"];
}
