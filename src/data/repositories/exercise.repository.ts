import { db } from "@/data/db";
import { normalizeSearchText } from "@/domain/search";
import {
  isPersisted,
  type ExerciseSet,
  type ExerciseTemplate,
  type WorkoutDay,
} from "@/domain/models/exercise";
import type { WorkoutSetLog } from "@/domain/models/workout-log";
import { deleteLogsByExercise } from "./workout-log.repository";

type CreateExercisePayload = Omit<ExerciseTemplate, "id" | "sortOrder"> & {
  sortOrder?: number;
};

type ExerciseMoveDirection = "up" | "down";

/** Saves a new exercise at the end of its day and returns its id. */
export async function createExerciseTemplate(payload: CreateExercisePayload): Promise<number> {
  return db.transaction("rw", db.exercises, async () => {
    const nextSortOrder =
      payload.sortOrder ?? (await getNextExerciseSortOrder(payload.day));

    // "++id" schema: Dexie always assigns a numeric key.
    return (await db.exercises.add({
      ...payload,
      sortOrder: nextSortOrder,
      title: payload.title.trim(),
    })) as number;
  });
}

const DEFAULT_SET_COUNT = 3;

/**
 * Adds a library exercise to a day with sensible defaults. If the exercise was
 * planned before (on any day), its latest set values are reused.
 */
export async function addLibraryExerciseToDay(
  day: WorkoutDay,
  item: Pick<
    ExerciseTemplate,
    "title" | "exerciseType" | "exerciseUnit" | "muscleTags"
  >,
) {
  const normalizedTitle = normalizeSearchText(item.title);
  const previous = (await db.exercises.reverse().toArray()).find(
    (exercise) => normalizeSearchText(exercise.title) === normalizedTitle,
  );
  const sourceSets: Partial<ExerciseSet>[] =
    previous && previous.exerciseSets.length > 0
      ? previous.exerciseSets
      : Array.from({ length: DEFAULT_SET_COUNT }, () => ({}));

  return createExerciseTemplate({
    day,
    title: item.title,
    exerciseType: previous?.exerciseType ?? item.exerciseType,
    exerciseUnit: previous?.exerciseUnit ?? item.exerciseUnit,
    muscleTags: previous?.muscleTags ?? item.muscleTags ?? [],
    exerciseSets: sourceSets.map((set) => ({
      id: crypto.randomUUID(),
      weight: set.weight,
      reps: set.reps,
      time: set.time,
    })),
  });
}

export async function getExerciseById(exerciseId: number) {
  return db.exercises.get(exerciseId);
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

/** Everything removed with an exercise, so the delete can be undone. */
export interface DeletedExercise {
  exercise: ExerciseTemplate;
  logs: WorkoutSetLog[];
}

/** Deletes an exercise and its logs; returns them for `restoreExercise`. */
export async function removeExerciseTemplate(
  exerciseId: number,
): Promise<DeletedExercise | undefined> {
  return db.transaction("rw", db.exercises, db.workoutLogs, async () => {
    const exercise = await db.exercises.get(exerciseId);

    if (!exercise) {
      return undefined;
    }

    const logs = await db.workoutLogs.where("exerciseId").equals(exerciseId).toArray();

    await deleteLogsByExercise(exerciseId);
    await db.exercises.delete(exerciseId);

    return { exercise, logs };
  });
}

/** Puts back an exercise (same id and position) and its logs. */
export async function restoreExercise({ exercise, logs }: DeletedExercise) {
  await db.transaction("rw", db.exercises, db.workoutLogs, async () => {
    await db.exercises.put(exercise);
    await db.workoutLogs.bulkPut(logs);
  });
}

/**
 * Appends copies of every exercise on `from` to the end of `to`, with fresh
 * set ids (history isn't copied). Returns the new exercise ids.
 */
export async function copyDay(from: WorkoutDay, to: WorkoutDay): Promise<number[]> {
  const source = await listExercisesForDay(from);
  const created: number[] = [];

  for (const exercise of source) {
    created.push(
      await createExerciseTemplate({
        day: to,
        title: exercise.title,
        exerciseType: exercise.exerciseType,
        exerciseUnit: exercise.exerciseUnit,
        muscleTags: exercise.muscleTags,
        exerciseSets: exercise.exerciseSets.map((set) => ({ ...set, id: crypto.randomUUID() })),
      }),
    );
  }

  return created;
}

/** Removes exercises that have no history yet (used to undo a copy). */
export async function removeExerciseTemplates(exerciseIds: number[]) {
  await db.exercises.bulkDelete(exerciseIds);
}

/** Adds a set, prefilled from `copyFrom` (usually the last set) if given. */
export async function addExerciseTemplateSet(
  exerciseId: number,
  copyFrom?: ExerciseSet,
) {
  await updateExerciseTemplateSets(exerciseId, (sets) => [
    ...sets,
    {
      id: crypto.randomUUID(),
      weight: copyFrom?.weight,
      reps: copyFrom?.reps,
      time: copyFrom?.time,
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
            ...sanitizeSetChanges(changes),
          }
        : set,
    ),
  );
}

/**
 * Removes a set from the template and returns it with its position, for
 * `restoreExerciseSet`. Logs are append-only history, so past logs stay.
 */
export async function removeExerciseSet(exerciseId: number, setId: string) {
  let removed: { set: ExerciseSet; index: number } | undefined;

  await updateExerciseTemplateSets(exerciseId, (sets) => {
    const index = sets.findIndex((set) => set.id === setId);

    if (index >= 0) {
      removed = { set: sets[index], index };
    }

    return sets.filter((set) => set.id !== setId);
  });

  return removed;
}

/** Re-inserts a removed set at its old position. */
export async function restoreExerciseSet(exerciseId: number, set: ExerciseSet, index: number) {
  await updateExerciseTemplateSets(exerciseId, (sets) => [
    ...sets.slice(0, index),
    set,
    ...sets.slice(index),
  ]);
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
    isPersisted,
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

function sanitizeSetChanges(changes: Partial<ExerciseSet>) {
  const sanitized = { ...changes };

  for (const key of ["weight", "reps", "time"] as const) {
    const value = sanitized[key];

    if (typeof value === "number" && (!Number.isFinite(value) || value < 0)) {
      sanitized[key] = undefined;
    }
  }

  return sanitized;
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
