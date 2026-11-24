import { db } from "@/data/db";
import { normalizeSearchText } from "@/domain/search";
import {
  isPersisted,
  type ExerciseSet,
  type ExerciseTemplate,
  type WorkoutDay,
} from "@/domain/models/exercise";
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

export async function removeExerciseTemplate(exerciseId: number) {
  await db.transaction("rw", db.exercises, db.workoutLogs, async () => {
    await deleteLogsByExercise(exerciseId);
    await db.exercises.delete(exerciseId);
  });
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

export async function removeExerciseSet(exerciseId: number, setId: string) {
  // Logs are append-only history: removing a template set keeps its past logs.
  await updateExerciseTemplateSets(exerciseId, (sets) =>
    sets.filter((set) => set.id !== setId),
  );
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
