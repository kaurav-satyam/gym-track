import { WEEKDAYS } from "../../../shared/constants/weekdays";
import { db } from "../db.client";
import type {
  ExerciseSet,
  ExerciseTemplate,
  WorkoutDay,
} from "../models/exercise.model";
import {
  deleteLogsByExercise,
  deleteLogsByExerciseSet,
} from "./workout-log.repository";

export type CreateExercisePayload = Omit<ExerciseTemplate, "id" | "sortOrder"> & {
  sortOrder?: number;
};

export type ExerciseMoveDirection = "up" | "down";

const dayOrder = new Map(WEEKDAYS.map((day, index) => [day, index]));

export async function createExerciseTemplate(payload: CreateExercisePayload) {
  return db.transaction("rw", db.exercises, async () => {
    const nextSortOrder =
      payload.sortOrder ?? (await getNextExerciseSortOrder(payload.day));

    return db.exercises.add({
      ...payload,
      sortOrder: nextSortOrder,
      title: payload.title.trim(),
      plannedDurationMin: normalizePlannedDuration(payload.plannedDurationMin),
    });
  });
}

export async function getExerciseById(exerciseId: number) {
  return db.exercises.get(exerciseId);
}

export async function listExerciseTemplates() {
  const exercises = await db.exercises.toArray();

  return [...exercises].sort((left, right) => {
    const leftDayOrder = dayOrder.get(left.day) ?? 0;
    const rightDayOrder = dayOrder.get(right.day) ?? 0;

    if (leftDayOrder !== rightDayOrder) {
      return leftDayOrder - rightDayOrder;
    }

    return compareExerciseDisplayOrder(left, right);
  });
}

export async function listExercisesForDay(day: WorkoutDay) {
  const exercises = await db.exercises.where("day").equals(day).toArray();

  return [...exercises].sort(compareExerciseDisplayOrder);
}

export async function updateExerciseTemplate(
  exerciseId: number,
  changes: Partial<ExerciseTemplate>,
) {
  await db.exercises.update(exerciseId, changes);
}

export async function removeExerciseTemplate(exerciseId: number) {
  await db.transaction("rw", db.exercises, db.workoutLogs, async () => {
    await deleteLogsByExercise(exerciseId);
    await db.exercises.delete(exerciseId);
  });
}

export async function addExerciseTemplateSet(exerciseId: number) {
  await updateExerciseTemplateSets(exerciseId, (sets) => [
    ...sets,
    {
      id: crypto.randomUUID(),
    },
  ]);
}

export async function updateExerciseTemplateSet(
  exerciseId: number,
  setId: string,
  changes: Partial<ExerciseSet>,
) {
  await updateExerciseTemplateSets(exerciseId, (sets) =>
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

export async function removeExerciseSet(exerciseId: number, setId: string) {
  await db.transaction("rw", db.exercises, db.workoutLogs, async () => {
    const exercise = await requireExerciseTemplate(exerciseId);

    await db.exercises.update(exerciseId, {
      exerciseSets: exercise.exerciseSets.filter((set) => set.id !== setId),
    });

    await deleteLogsByExerciseSet(setId);
  });
}

export async function moveExerciseTemplate(
  exerciseId: number,
  direction: ExerciseMoveDirection,
) {
  await db.transaction("rw", db.exercises, async () => {
    const exercise = await requireExerciseTemplate(exerciseId);
    const dayExercises = await listExercisesForDay(exercise.day);
    const orderedExercises = await normalizeExerciseSortOrder(dayExercises);
    const currentIndex = orderedExercises.findIndex((item) => item.id === exerciseId);

    if (currentIndex < 0) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= orderedExercises.length) {
      return;
    }

    const reorderedExercises = [...orderedExercises];
    const [movedExercise] = reorderedExercises.splice(currentIndex, 1);

    reorderedExercises.splice(targetIndex, 0, movedExercise);

    await Promise.all(
      reorderedExercises.map((item, index) =>
        db.exercises.update(item.id!, {
          sortOrder: index,
        }),
      ),
    );
  });
}

async function requireExerciseTemplate(exerciseId: number) {
  const exercise = await db.exercises.get(exerciseId);

  if (!exercise) {
    throw new Error(`Exercise ${exerciseId} was not found.`);
  }

  return exercise;
}

async function updateExerciseTemplateSets(
  exerciseId: number,
  updater: (sets: ExerciseSet[]) => ExerciseSet[],
) {
  await db.transaction("rw", db.exercises, async () => {
    const exercise = await requireExerciseTemplate(exerciseId);

    await db.exercises.update(exerciseId, {
      exerciseSets: updater(exercise.exerciseSets),
    });
  });
}

async function getNextExerciseSortOrder(day: WorkoutDay) {
  const exercises = await db.exercises.where("day").equals(day).toArray();

  if (exercises.length === 0) {
    return 0;
  }

  return exercises.reduce((maxSortOrder, exercise) => {
    const nextSortOrder = typeof exercise.sortOrder === "number" ? exercise.sortOrder : -1;

    return Math.max(maxSortOrder, nextSortOrder);
  }, -1) + 1;
}

async function normalizeExerciseSortOrder(exercises: ExerciseTemplate[]) {
  const persistedExercises = exercises.filter(
    (exercise): exercise is ExerciseTemplate & { id: number } =>
      exercise.id != null,
  );

  await Promise.all(
    persistedExercises.map((exercise, index) => {
      if (exercise.sortOrder === index) {
        return Promise.resolve();
      }

      return db.exercises.update(exercise.id, {
        sortOrder: index,
      });
    }),
  );

  return persistedExercises.map((exercise, index) => ({
    ...exercise,
    sortOrder: index,
  }));
}

function normalizePlannedDuration(duration?: number) {
  if (typeof duration !== "number" || Number.isNaN(duration) || duration <= 0) {
    return undefined;
  }

  return Math.round(duration);
}

function compareExerciseDisplayOrder(
  left: ExerciseTemplate,
  right: ExerciseTemplate,
) {
  const leftSortOrder =
    typeof left.sortOrder === "number" ? left.sortOrder : Number.POSITIVE_INFINITY;
  const rightSortOrder =
    typeof right.sortOrder === "number" ? right.sortOrder : Number.POSITIVE_INFINITY;

  if (leftSortOrder !== rightSortOrder) {
    return leftSortOrder - rightSortOrder;
  }

  return (right.id ?? 0) - (left.id ?? 0);
}
