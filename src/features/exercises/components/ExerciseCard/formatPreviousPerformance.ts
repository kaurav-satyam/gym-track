import type {
  ExerciseType,
  ExerciseUnit,
} from "../../../../app/db/models/exercise.model";
import type { WorkoutSetLog } from "../../../../app/db/models/workout-log.model";

interface IFormatPreviousPerformanceArgs {
  exerciseType: ExerciseType;
  exerciseUnit: ExerciseUnit;
  previousLog?: WorkoutSetLog;
}

export default function formatPreviousPerformance({
  exerciseType,
  exerciseUnit,
  previousLog,
}: IFormatPreviousPerformanceArgs) {
  if (!previousLog) {
    return "--";
  }

  if (exerciseType === "reps") {
    const weight = formatLoggedValue(previousLog.weight);
    const reps = formatLoggedValue(previousLog.reps);

    if (weight && reps) {
      return `${weight}${exerciseUnit}x${reps}`;
    }

    if (weight) {
      return `${weight}${exerciseUnit}`;
    }

    if (reps) {
      return `${reps} reps`;
    }

    return "--";
  }

  const time = formatLoggedValue(previousLog.time);

  return time ? `${time}${exerciseUnit}` : "--";
}

function formatLoggedValue(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "";
  }

  return Number.isInteger(value) ? String(value) : value.toString();
}
