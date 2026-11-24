import { Dexie } from "dexie";
import { db } from "@/data/db";
import type { ExerciseSet } from "@/domain/models/exercise";
import type { WorkoutSetLog } from "@/domain/models/workout-log";
import { getDayBounds } from "@/domain/dates";

export async function listExerciseHistory(exerciseId: number) {
  const logs = await db.workoutLogs.where("exerciseId").equals(exerciseId).toArray();

  return logs.sort(
    (left, right) => right.completedAt.getTime() - left.completedAt.getTime(),
  );
}

/** Latest log for each given set, using one indexed lookup per set. */
export async function listLatestLogsBySetId(exerciseSetIds: string[]) {
  const entries = await Promise.all(
    exerciseSetIds.map(async (setId) => {
      const log = await db.workoutLogs
        .where("[exerciseSetId+completedAt]")
        .between([setId, Dexie.minKey], [setId, Dexie.maxKey])
        .last();

      return [setId, log] as const;
    }),
  );

  return new Map(
    entries.filter((entry): entry is [string, WorkoutSetLog] => entry[1] != null),
  );
}

/** Set ids completed on `date` (default today) across the given exercises. */
export async function listCompletedSetIdsForDay(
  exerciseIds: number[],
  date = new Date(),
) {
  const perExercise = await Promise.all(
    exerciseIds.map((exerciseId) => listCompletedSetIdsForExerciseDay(exerciseId, date)),
  );

  return new Set(perExercise.flat());
}

async function listCompletedSetIdsForExerciseDay(
  exerciseId: number,
  date = new Date(),
) {
  const logs = await listExerciseHistoryForDay(exerciseId, date);

  return logs.map((log) => log.exerciseSetId);
}

export async function logExerciseSetCompletion(
  exerciseId: number,
  set: ExerciseSet,
  completedAt = new Date(),
) {
  // Check + add in one transaction so a double tap can't log a set twice.
  return db.transaction("rw", db.workoutLogs, async () => {
    const existingLog = await getExerciseSetCompletionForDay(
      set.id,
      completedAt,
    );

    if (existingLog?.id) {
      return existingLog.id;
    }

    return db.workoutLogs.add({
      exerciseId,
      exerciseSetId: set.id,
      completedAt,
      weight: set.weight,
      reps: set.reps,
      time: set.time,
    });
  });
}

export async function removeExerciseSetCompletion(
  exerciseSetId: string,
  date = new Date(),
) {
  const existingLog = await getExerciseSetCompletionForDay(exerciseSetId, date);

  if (!existingLog?.id) {
    return;
  }

  await db.workoutLogs.delete(existingLog.id);
}

export async function deleteLogsByExercise(exerciseId: number) {
  await db.workoutLogs.where("exerciseId").equals(exerciseId).delete();
}

async function listExerciseHistoryForDay(exerciseId: number, date: Date) {
  const { start, end } = getDayBounds(date);

  return db.workoutLogs
    .where("[exerciseId+completedAt]")
    .between([exerciseId, start], [exerciseId, end], true, true)
    .toArray();
}

async function getExerciseSetCompletionForDay(
  exerciseSetId: string,
  date: Date,
): Promise<WorkoutSetLog | undefined> {
  const { start, end } = getDayBounds(date);
  const logs = await db.workoutLogs
    .where("[exerciseSetId+completedAt]")
    .between([exerciseSetId, start], [exerciseSetId, end], true, true)
    .toArray();

  return logs.at(-1);
}
