import { seedExerciseLibrary } from "@/data/repositories/exercise-library.repository";
import type { ExerciseLibrarySeedItem } from "@/domain/models/exercise-library";

const EXERCISE_LIBRARY_URL = import.meta.env.BASE_URL + "data/exerciseLibrary.json";

async function loadExerciseLibrary() {
  const response = await fetch(EXERCISE_LIBRARY_URL);

  if (!response.ok) {
    throw new Error("Exercise library could not be loaded.");
  }

  return (await response.json()) as ExerciseLibrarySeedItem[];
}

let ensurePromise: Promise<void> | undefined;

/**
 * Makes sure the built-in exercises are in IndexedDB. Runs once per page load;
 * only missing items are inserted, so user edits are never overwritten.
 * Never rejects: offline on first run just leaves the library as it is, and
 * the next call tries again.
 */
export function ensureExerciseLibrary(): Promise<void> {
  ensurePromise ??= (async () => {
    await seedExerciseLibrary(await loadExerciseLibrary());
  })().catch((error: unknown) => {
    console.error("Exercise library could not be prepared:", error);
    ensurePromise = undefined;
  });

  return ensurePromise;
}
