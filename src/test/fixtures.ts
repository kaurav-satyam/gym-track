import type { ExerciseSet, PersistedExercise, WorkoutDay } from "@/domain/models/exercise";
import type { WorkoutSetLog } from "@/domain/models/workout-log";

/** Local-time date helper: at(2026, 11, 24, 18) = 24 Nov 2026 18:00 local. */
export function at(year: number, month: number, day: number, hour = 12, minute = 0) {
  return new Date(year, month - 1, day, hour, minute);
}

let nextSetId = 0;

export function set(values: Omit<ExerciseSet, "id"> = {}): ExerciseSet {
  nextSetId += 1;

  return { id: `set-${nextSetId}`, ...values };
}

export function exercise(
  id: number,
  day: WorkoutDay,
  overrides: Partial<PersistedExercise> = {},
): PersistedExercise {
  return {
    id,
    day,
    sortOrder: 0,
    title: `Exercise ${id}`,
    exerciseType: "reps",
    exerciseUnit: "kg",
    muscleTags: [],
    exerciseSets: [set({ weight: 50, reps: 10 })],
    ...overrides,
  };
}

export function log(
  exercise: PersistedExercise,
  setIndex: number,
  completedAt: Date,
  values: Partial<Pick<WorkoutSetLog, "weight" | "reps" | "time">> = {},
): WorkoutSetLog {
  const template = exercise.exerciseSets[setIndex];

  return {
    exerciseId: exercise.id,
    exerciseSetId: template.id,
    completedAt,
    weight: template.weight,
    reps: template.reps,
    time: template.time,
    ...values,
  };
}
