import type { ExerciseType, ExerciseUnit } from "./exercise.model";

export interface ExerciseLibraryItem {
  id: string;
  title: string;
  normalizedTitle: string;
  exerciseType: ExerciseType;
  exerciseUnit: ExerciseUnit;
  muscleTags: string[];
  category: string;
  plannedDurationMin?: number;
  isBuiltIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ExerciseLibrarySeedItem = Omit<
  ExerciseLibraryItem,
  "normalizedTitle" | "isBuiltIn" | "createdAt" | "updatedAt"
>;
