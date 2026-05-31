import { db } from "..";

import type { IExerciseSet } from "../table/exercise.table";

export async function completeSet(exerciseId: number, set: IExerciseSet) {
  await db.workoutlogs.add({
    exerciseId,
    exerciseSetId: set.id,

    completedAt: new Date(),

    weight: set.weight,
    reps: set.reps,
    time: set.time,
  });
}

export async function uncompleteSet(exerciseSetId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const log = await db.workoutlogs
    .where("exerciseSetId")
    .equals(exerciseSetId)
    .filter((log) => log.completedAt >= start && log.completedAt <= end)
    .first();

  if (!log?.id) return;

  await db.workoutlogs.delete(log.id);
}
