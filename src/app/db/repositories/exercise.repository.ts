import { db } from "..";
import type {
  IExerciseSet,
  IExerciseTable,
  TDay,
} from "../table/exercise.table";
import {
  deleteLogsByExercise,
  deleteLogsByExerciseSet,
} from "./workout-log.repository";

export type ICreateExercisePayload = Omit<IExerciseTable, "id">;

export async function createExercise(payload: ICreateExercisePayload) {
  return db.exercises.add({
    ...payload,
    title: payload.title.trim(),
  });
}

export async function getExercise(exerciseId: number) {
  return db.exercises.get(exerciseId);
}

export async function listExercises() {
  const exercises = await db.exercises.toArray();

  return sortExercisesByNewest(exercises);
}

export async function listExercisesByDay(day: TDay) {
  const exercises = await db.exercises.where("day").equals(day).toArray();

  return sortExercisesByNewest(exercises);
}

export async function updateExercise(
  exerciseId: number,
  changes: Partial<IExerciseTable>,
) {
  await db.exercises.update(exerciseId, changes);
}

export async function deleteExercise(exerciseId: number) {
  await db.transaction("rw", db.exercises, db.workoutLogs, async () => {
    await deleteLogsByExercise(exerciseId);
    await db.exercises.delete(exerciseId);
  });
}

export async function addExerciseSet(exerciseId: number) {
  await updateExerciseSets(exerciseId, (sets) => [
    ...sets,
    {
      id: crypto.randomUUID(),
    },
  ]);
}

export async function updateExerciseSet(
  exerciseId: number,
  setId: string,
  changes: Partial<IExerciseSet>,
) {
  await updateExerciseSets(exerciseId, (sets) =>
    sets.map((set) =>
      set.id === setId
        ? {
            ...set,
            ...changes,
          }
        : set,
    ),
  );
}

export async function deleteExerciseSet(exerciseId: number, setId: string) {
  await db.transaction("rw", db.exercises, db.workoutLogs, async () => {
    const exercise = await requireExercise(exerciseId);

    await db.exercises.update(exerciseId, {
      exerciseSets: exercise.exerciseSets.filter((set) => set.id !== setId),
    });

    await deleteLogsByExerciseSet(setId);
  });
}

async function requireExercise(exerciseId: number) {
  const exercise = await db.exercises.get(exerciseId);

  if (!exercise) {
    throw new Error(`Exercise ${exerciseId} was not found.`);
  }

  return exercise;
}

async function updateExerciseSets(
  exerciseId: number,
  updater: (sets: IExerciseSet[]) => IExerciseSet[],
) {
  await db.transaction("rw", db.exercises, async () => {
    const exercise = await requireExercise(exerciseId);

    await db.exercises.update(exerciseId, {
      exerciseSets: updater(exercise.exerciseSets),
    });
  });
}

function sortExercisesByNewest(exercises: IExerciseTable[]) {
  return [...exercises].sort((left, right) => (right.id ?? 0) - (left.id ?? 0));
}
