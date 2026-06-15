import type { ExerciseLibrarySeedItem } from "../../../app/db/models/exercise-library.model";

const EXERCISE_LIBRARY_URL = import.meta.env.BASE_URL + "data/exerciseLibrary.json";

export async function loadExerciseLibrary() {
  const response = await fetch(EXERCISE_LIBRARY_URL);

  if (!response.ok) {
    throw new Error("Exercise library could not be loaded.");
  }

  return (await response.json()) as ExerciseLibrarySeedItem[];
}
