import type { PersistedExercise } from "@/domain/models/exercise";

export interface WorkoutDayStatus {
  totalSets: number;
  doneSets: number;
  /** 0-100, rounded. */
  percent: number;
  /** First exercise with an unfinished set; undefined when everything is done. */
  firstUnfinishedId?: number;
}

/** Completion of a day's plan given the set ids completed today. */
export function getWorkoutDayStatus(
  exercises: PersistedExercise[],
  completedSetIds: ReadonlySet<string>,
): WorkoutDayStatus {
  const sets = exercises.flatMap((exercise) => exercise.exerciseSets);
  const doneSets = sets.filter((set) => completedSetIds.has(set.id)).length;

  return {
    totalSets: sets.length,
    doneSets,
    percent: sets.length === 0 ? 0 : Math.round((doneSets / sets.length) * 100),
    firstUnfinishedId: exercises.find((exercise) =>
      exercise.exerciseSets.some((set) => !completedSetIds.has(set.id)),
    )?.id,
  };
}
