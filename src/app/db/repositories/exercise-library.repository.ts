import Fuse from "fuse.js";
import { db } from "../db.client";
import type {
  ExerciseLibraryItem,
  ExerciseLibrarySeedItem,
} from "../models/exercise-library.model";
import type { ExerciseType } from "../models/exercise.model";

export interface ExerciseLibraryFilters {
  query?: string;
  category?: string;
  exerciseType?: ExerciseType | "all";
  limit?: number;
}

export async function seedExerciseLibrary(
  seedItems: ExerciseLibrarySeedItem[],
) {
  const now = new Date();
  const seededItems: ExerciseLibraryItem[] = seedItems.map((item) => ({
    ...item,
    normalizedTitle: normalizeSearchText(item.title),
    isBuiltIn: true,
    createdAt: now,
    updatedAt: now,
  }));

  await db.exerciseLibrary.bulkPut(seededItems);
}

export async function listExerciseLibraryItems({
  query = "",
  category = "all",
  exerciseType = "all",
  limit = 80,
}: ExerciseLibraryFilters = {}) {
  const normalizedQuery = normalizeSearchText(query);
  const hasFilters = category !== "all" || exerciseType !== "all";
  let collection = db.exerciseLibrary.orderBy("normalizedTitle");

  if (category !== "all") {
    collection = db.exerciseLibrary.where("category").equals(category);
  } else if (exerciseType !== "all") {
    collection = db.exerciseLibrary.where("exerciseType").equals(exerciseType);
  }

  const candidates =
    normalizedQuery || hasFilters
      ? await collection.toArray()
      : await collection.limit(limit).toArray();
  const filteredCandidates = candidates.filter((item) => {
    if (category !== "all" && item.category !== category) {
      return false;
    }

    if (exerciseType !== "all" && item.exerciseType !== exerciseType) {
      return false;
    }

    return true;
  });

  if (!normalizedQuery) {
    return filteredCandidates
      .sort((left, right) => left.title.localeCompare(right.title))
      .slice(0, limit);
  }

  const fuse = new Fuse(filteredCandidates, {
    ignoreLocation: true,
    includeScore: true,
    keys: ["title", "category", "muscleTags"],
    threshold: 0.35,
  });

  return fuse
    .search(normalizedQuery)
    .sort((left, right) => (left.score ?? 0) - (right.score ?? 0))
    .map((result) => result.item)
    .slice(0, limit);
}

export async function getExerciseLibraryItemByTitle(title: string) {
  const normalizedTitle = normalizeSearchText(title);

  return db.exerciseLibrary
    .where("normalizedTitle")
    .equals(normalizedTitle)
    .first();
}

export async function createCustomExerciseLibraryItem(
  payload: Omit<
    ExerciseLibrarySeedItem,
    "id" | "category" | "muscleTags"
  > &
    Partial<
      Pick<ExerciseLibrarySeedItem, "category" | "muscleTags">
    >,
) {
  const now = new Date();
  const item: ExerciseLibraryItem = {
    id: `custom-${crypto.randomUUID()}`,
    title: payload.title.trim(),
    normalizedTitle: normalizeSearchText(payload.title),
    exerciseType: payload.exerciseType,
    exerciseUnit: payload.exerciseUnit,
    muscleTags: payload.muscleTags ?? [],
    category: payload.category ?? "Other",
    plannedDurationMin: payload.plannedDurationMin,
    isBuiltIn: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.exerciseLibrary.put(item);

  return item;
}

export async function updateExerciseLibraryItemDefaults(
  exerciseId: string,
  changes: Partial<
    Pick<
      ExerciseLibraryItem,
      | "exerciseType"
      | "exerciseUnit"
      | "muscleTags"
      | "category"
      | "plannedDurationMin"
    >
  >,
) {
  await db.exerciseLibrary.update(exerciseId, {
    ...changes,
    updatedAt: new Date(),
  });
}

export function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

