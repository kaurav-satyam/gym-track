import type { ExerciseTemplate } from "../models/exercise.model";
import type { WorkoutSetLog } from "../models/workout-log.model";

export function calculateLoadVolume(log: WorkoutSetLog) {
  return (log.weight ?? 0) * (log.reps ?? 0);
}

export function calculateTimeSeconds(log: WorkoutSetLog, exercise?: ExerciseTemplate) {
  if (exercise?.exerciseType !== "time") {
    return 0;
  }

  const value = log.time ?? 0;

  if (exercise.exerciseUnit === "hr") {
    return value * 3600;
  }

  if (exercise.exerciseUnit === "min") {
    return value * 60;
  }

  return value;
}

export function getBestSetValue(exercise: ExerciseTemplate, logs: WorkoutSetLog[]) {
  if (exercise.exerciseType === "time") {
    return logs.reduce((best, log) => Math.max(best, log.time ?? 0), 0);
  }

  return logs.reduce((best, log) => Math.max(best, log.weight ?? 0), 0);
}
