import { db } from "../db.client";
import type { ExerciseSet } from "../models/exercise.model";
import type { WorkoutSetLog } from "../models/workout-log.model";
import { getDayBounds } from "../utils/getDayBounds";

export async function listExerciseHistory(exerciseId: number) {
  const logs = await db.workoutLogs.where("exerciseId").equals(exerciseId).toArray();

  return logs.sort(
    (left, right) => right.completedAt.getTime() - left.completedAt.getTime(),
  );
}

export async function listCompletedSetIdsForExerciseDay(
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
  const existingLog = await getExerciseSetCompletionForDay(set.id, completedAt);

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

export async function deleteLogsByExerciseSet(exerciseSetId: string) {
  await db.workoutLogs.where("exerciseSetId").equals(exerciseSetId).delete();
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
