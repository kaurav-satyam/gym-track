import type { WEEKDAYS } from "@/domain/weekdays";

export const EXERCISE_TYPES = ["reps", "time"] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

const EXERCISE_WEIGHT_UNITS = ["kg", "lb"] as const;
const EXERCISE_TIME_UNITS = ["sec", "min", "hr"] as const;

export type ExerciseUnit = (
  | typeof EXERCISE_WEIGHT_UNITS
  | typeof EXERCISE_TIME_UNITS
)[number];

export type WorkoutDay = (typeof WEEKDAYS)[number];

export interface ExerciseSet {
  id: string;
  weight?: number;
  reps?: number;
  time?: number;
}

export interface ExerciseTemplate {
  id?: number;
  day: WorkoutDay;
  sortOrder: number;
  title: string;
  exerciseType: ExerciseType;
  exerciseUnit: ExerciseUnit;
  muscleTags?: string[];
  exerciseSets: ExerciseSet[];
}

/** An exercise that has been saved (Dexie assigned its auto-increment id). */
export type PersistedExercise = ExerciseTemplate & { id: number };

export function isPersisted(exercise: ExerciseTemplate): exercise is PersistedExercise {
  return exercise.id != null;
}

/** Unit an exercise switches to when its tracking type changes. */
export function defaultUnitFor(exerciseType: ExerciseType): ExerciseUnit {
  return exerciseType === "time" ? "sec" : "kg";
}

/** Units that make sense for a tracking type. */
export function unitsFor(exerciseType: ExerciseType): readonly ExerciseUnit[] {
  return exerciseType === "time" ? EXERCISE_TIME_UNITS : EXERCISE_WEIGHT_UNITS;
}
