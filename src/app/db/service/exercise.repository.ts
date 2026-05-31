import { db } from "..";

import type { IExerciseSet } from "../table/exercise.table";

export async function addSet(exerciseId: number) {
  const exercise = await db.exercises.get(exerciseId);

  if (!exercise) return;

  await db.exercises.update(exerciseId, {
    exerciseSets: [
      ...exercise.exerciseSets,
      {
        id: crypto.randomUUID(),
      },
    ],
  });
}

export async function updateSet(
  exerciseId: number,
  setId: string,
  updates: Partial<IExerciseSet>,
) {
  const exercise = await db.exercises.get(exerciseId);

  if (!exercise) return;

  const nextSets = exercise.exerciseSets.map((set) =>
    set.id === setId
      ? {
          ...set,
          ...updates,
        }
      : set,
  );

  await db.exercises.update(exerciseId, {
    exerciseSets: nextSets,
  });
}

export async function deleteSet(exerciseId: number, setId: string) {
  const exercise = await db.exercises.get(exerciseId);

  if (!exercise) return;

  await db.exercises.update(exerciseId, {
    exerciseSets: exercise.exerciseSets.filter((set) => set.id !== setId),
  });
}
