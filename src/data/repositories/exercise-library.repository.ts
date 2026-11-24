import Fuse from "fuse.js";
import { db } from "@/data/db";
import { normalizeSearchText } from "@/domain/search";
import type {
  ExerciseLibraryItem,
  ExerciseLibrarySeedItem,
} from "@/domain/models/exercise-library";

interface ExerciseLibraryFilters {
  query?: string;
  category?: string;
  limit?: number;
}

export async function seedExerciseLibrary(
  seedItems: ExerciseLibrarySeedItem[],
) {
  // Only insert missing built-ins so user edits to defaults survive reloads.
  const existingIds = new Set(
    (await db.exerciseLibrary.toCollection().primaryKeys()) as string[],
  );
  const now = new Date();
  const newItems: ExerciseLibraryItem[] = seedItems
    .filter((item) => !existingIds.has(item.id))
    .map((item) => ({
      ...item,
      normalizedTitle: normalizeSearchText(item.title),
      isBuiltIn: true,
      createdAt: now,
      updatedAt: now,
    }));

  if (newItems.length > 0) {
    await db.exerciseLibrary.bulkAdd(newItems);
  }
}

export async function listExerciseLibraryItems({
  query = "",
  category = "all",
  limit = 80,
}: ExerciseLibraryFilters = {}) {
  const normalizedQuery = normalizeSearchText(query);
  const collection =
    category === "all"
      ? db.exerciseLibrary.orderBy("normalizedTitle")
      : db.exerciseLibrary.where("category").equals(category);
  const filteredCandidates =
    normalizedQuery || category !== "all"
      ? await collection.toArray()
      : await collection.limit(limit).toArray();

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
    isBuiltIn: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.exerciseLibrary.put(item);

  return item;
}


export async function listExerciseLibraryCategories() {
  return (await db.exerciseLibrary.orderBy("category").uniqueKeys()) as string[];
}

/** Library items for the exercises most recently put into any day plan. */
export async function listRecentlyUsedLibraryItems(limit = 6) {
  const templates = await db.exercises.reverse().toArray();
  const seen = new Set<string>();
  const items: ExerciseLibraryItem[] = [];

  for (const template of templates) {
    const normalizedTitle = normalizeSearchText(template.title);

    if (seen.has(normalizedTitle)) {
      continue;
    }

    seen.add(normalizedTitle);
    const item = await db.exerciseLibrary
      .where("normalizedTitle")
      .equals(normalizedTitle)
      .first();

    if (item) {
      items.push(item);
    }

    if (items.length >= limit) {
      break;
    }
  }

  return items;
}
