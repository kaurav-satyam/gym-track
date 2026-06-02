import type { WEEKDAYS } from "../../../shared/constants/weekdays";

export const EXERCISE_TYPES = ["reps", "time"] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export const EXERCISE_WEIGHT_UNITS = ["kg", "lb"] as const;
export const EXERCISE_TIME_UNITS = ["sec", "min", "hr"] as const;

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
  plannedDurationMin?: number;
  exerciseSets: ExerciseSet[];
}
