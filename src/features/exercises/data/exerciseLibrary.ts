import type {
  ExerciseType,
  ExerciseUnit,
} from "../../../app/db/models/exercise.model";

export interface ExerciseLibraryItem {
  id: string;
  title: string;
  exerciseType: ExerciseType;
  exerciseUnit: ExerciseUnit;
  plannedDurationMin?: number;
}

export const exerciseLibrary: ExerciseLibraryItem[] = [
  {
    id: "bench-press",
    title: "Bench Press",
    exerciseType: "reps",
    exerciseUnit: "kg",
    plannedDurationMin: 15,
  },
  {
    id: "incline-dumbbell-press",
    title: "Incline Dumbbell Press",
    exerciseType: "reps",
    exerciseUnit: "kg",
    plannedDurationMin: 12,
  },
  {
    id: "squat",
    title: "Squat",
    exerciseType: "reps",
    exerciseUnit: "kg",
    plannedDurationMin: 18,
  },
  {
    id: "deadlift",
    title: "Deadlift",
    exerciseType: "reps",
    exerciseUnit: "kg",
    plannedDurationMin: 18,
  },
  {
    id: "overhead-press",
    title: "Overhead Press",
    exerciseType: "reps",
    exerciseUnit: "kg",
    plannedDurationMin: 12,
  },
  {
    id: "lat-pulldown",
    title: "Lat Pulldown",
    exerciseType: "reps",
    exerciseUnit: "kg",
    plannedDurationMin: 10,
  },
  {
    id: "seated-row",
    title: "Seated Row",
    exerciseType: "reps",
    exerciseUnit: "kg",
    plannedDurationMin: 10,
  },
  {
    id: "leg-press",
    title: "Leg Press",
    exerciseType: "reps",
    exerciseUnit: "kg",
    plannedDurationMin: 12,
  },
  {
    id: "bicep-curl",
    title: "Bicep Curl",
    exerciseType: "reps",
    exerciseUnit: "kg",
    plannedDurationMin: 8,
  },
  {
    id: "triceps-pushdown",
    title: "Triceps Pushdown",
    exerciseType: "reps",
    exerciseUnit: "kg",
    plannedDurationMin: 8,
  },
  {
    id: "plank",
    title: "Plank",
    exerciseType: "time",
    exerciseUnit: "sec",
    plannedDurationMin: 5,
  },
  {
    id: "treadmill",
    title: "Treadmill",
    exerciseType: "time",
    exerciseUnit: "min",
    plannedDurationMin: 20,
  },
  {
    id: "cycling",
    title: "Cycling",
    exerciseType: "time",
    exerciseUnit: "min",
    plannedDurationMin: 20,
  },
  {
    id: "battle-ropes",
    title: "Battle Ropes",
    exerciseType: "time",
    exerciseUnit: "sec",
    plannedDurationMin: 8,
  },
];
