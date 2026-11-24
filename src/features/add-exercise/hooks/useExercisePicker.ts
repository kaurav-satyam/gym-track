import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import {
  createCustomExerciseLibraryItem,
  listExerciseLibraryCategories,
  listExerciseLibraryItems,
  listRecentlyUsedLibraryItems,
} from "@/data/repositories/exercise-library.repository";
import {
  addLibraryExerciseToDay,
  listExercisesForDay,
} from "@/data/repositories/exercise.repository";
import { ensureExerciseLibrary } from "@/data/seed/exercise-library";
import type { WorkoutDay } from "@/domain/models/exercise";
import type { ExerciseLibraryItem } from "@/domain/models/exercise-library";
import { normalizeSearchText } from "@/domain/search";

export const ALL_CATEGORIES = "all";
const RESULT_LIMIT = 200;

/**
 * Search/filter state, live library results and the add actions for the
 * Add Exercise screen. Lists are empty until the built-in library is ready.
 */
export function useExercisePicker(day: WorkoutDay) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [libraryReady, setLibraryReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    void ensureExerciseLibrary().then(() => mounted && setLibraryReady(true));

    return () => {
      mounted = false;
    };
  }, []);

  const trimmedQuery = query.trim();
  const isBrowsing = trimmedQuery === "" && category === ALL_CATEGORIES;

  const categories = useLiveQuery(
    () => (libraryReady ? listExerciseLibraryCategories() : []),
    [libraryReady],
    [],
  );
  const results = useLiveQuery(
    () =>
      libraryReady
        ? listExerciseLibraryItems({ query: trimmedQuery, category, limit: RESULT_LIMIT })
        : [],
    [libraryReady, trimmedQuery, category],
  );
  const recent = useLiveQuery(
    () => (libraryReady && isBrowsing ? listRecentlyUsedLibraryItems() : []),
    [libraryReady, isBrowsing],
    [],
  );
  const plannedTitles = useLiveQuery(
    async () =>
      new Set((await listExercisesForDay(day)).map((exercise) => normalizeSearchText(exercise.title))),
    [day],
    new Set<string>(),
  );

  const hasExactMatch = (results ?? []).some(
    (item) => item.normalizedTitle === normalizeSearchText(trimmedQuery),
  );
  const recentIds = new Set(recent.map((item) => item.id));

  async function add(item: ExerciseLibraryItem) {
    await addLibraryExerciseToDay(day, item);
    navigator.vibrate?.(10);
  }

  async function createAndAdd() {
    const item = await createCustomExerciseLibraryItem({
      title: trimmedQuery,
      exerciseType: "reps",
      exerciseUnit: "kg",
      muscleTags: [],
    });

    await add(item);
    setQuery("");
  }

  return {
    query,
    setQuery,
    trimmedQuery,
    category,
    setCategory,
    categories,
    isBrowsing,
    /** undefined while the first search is running. */
    results,
    recent,
    /** Search results minus anything already shown under "Recent". */
    listed: isBrowsing ? (results ?? []).filter((item) => !recentIds.has(item.id)) : (results ?? []),
    /** Offer "Create …" only when a search has no exact title match. */
    showCreate: Boolean(trimmedQuery && !hasExactMatch && results),
    isPlanned: (item: ExerciseLibraryItem) => plannedTitles.has(item.normalizedTitle),
    add,
    createAndAdd,
  };
}
