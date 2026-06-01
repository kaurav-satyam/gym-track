import type { WEEKDAYS } from "../../../data/weekday.data";

export const ExerciseTypes = ["reps", "time"] as const;
export type TExerciseType = (typeof ExerciseTypes)[number];

export const ExerciseWeightUnits = ["kg", "lb"] as const;
export const ExerciseTimeUnits = ["sec", "min", "hr"] as const;

export type TExerciseUnitType = (
  | typeof ExerciseWeightUnits
  | typeof ExerciseTimeUnits
)[number];

export type TDay = (typeof WEEKDAYS)[number];

export interface IExerciseSet {
  id: string;

  weight?: number;
  reps?: number;
  time?: number;
}

export interface IExerciseTable {
  id?: number;

  day: TDay;

  title: string;

  exerciseType: TExerciseType;

  exerciseUnit: TExerciseUnitType;

  plannedDurationMin?: number;

  exerciseSets: IExerciseSet[];
}

export const ExerciseSchema = "++id,day,title,exerciseType";
