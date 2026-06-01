import { db } from "..";
import type { IExerciseSet } from "../table/exercise.table";
import type { IWorkoutSetLog } from "../table/workout-log.table";
import { getDayBounds } from "../utils/date";

export async function listWorkoutLogsByExercise(exerciseId: number) {
  const logs = await db.workoutLogs.where("exerciseId").equals(exerciseId).toArray();

  return logs.sort(
    (left, right) => right.completedAt.getTime() - left.completedAt.getTime(),
  );
}

export async function listCompletedSetIdsByExerciseOnDate(
  exerciseId: number,
  date = new Date(),
) {
  const logs = await listWorkoutLogsByExerciseOnDate(exerciseId, date);

  return logs.map((log) => log.exerciseSetId);
}

export async function completeExerciseSet(
  exerciseId: number,
  set: IExerciseSet,
  completedAt = new Date(),
) {
  const existingLog = await getWorkoutLogBySetOnDate(set.id, completedAt);

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

export async function uncompleteExerciseSet(
  exerciseSetId: string,
  date = new Date(),
) {
  const existingLog = await getWorkoutLogBySetOnDate(exerciseSetId, date);

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

async function listWorkoutLogsByExerciseOnDate(
  exerciseId: number,
  date: Date,
) {
  const { start, end } = getDayBounds(date);

  return db.workoutLogs
    .where("[exerciseId+completedAt]")
    .between([exerciseId, start], [exerciseId, end], true, true)
    .toArray();
}

async function getWorkoutLogBySetOnDate(
  exerciseSetId: string,
  date: Date,
): Promise<IWorkoutSetLog | undefined> {
  const { start, end } = getDayBounds(date);
  const logs = await db.workoutLogs
    .where("[exerciseSetId+completedAt]")
    .between([exerciseSetId, start], [exerciseSetId, end], true, true)
    .toArray();

  return logs.at(-1);
}
