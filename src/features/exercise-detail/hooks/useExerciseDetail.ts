import { useLiveQuery } from "dexie-react-hooks";
import { isBuiltInExercise } from "@/data/repositories/exercise-library.repository";
import { getExerciseById } from "@/data/repositories/exercise.repository";
import { listExerciseHistory } from "@/data/repositories/workout-log.repository";
import { summarizeHistory } from "@/domain/history";
import { isPersisted, type PersistedExercise } from "@/domain/models/exercise";

/**
 * Live exercise by route id: `undefined` while loading, `null` when it
 * doesn't exist (bad id or deleted).
 */
export function useExercise(exerciseId: number): PersistedExercise | null | undefined {
  return useLiveQuery(async () => {
    const exercise = Number.isFinite(exerciseId) ? await getExerciseById(exerciseId) : undefined;

    return exercise && isPersisted(exercise) ? exercise : null;
  }, [exerciseId]);
}

/** Sessions (newest first) and best set for an exercise, kept live. */
export function useExerciseHistory(exercise: PersistedExercise) {
  const logs = useLiveQuery(() => listExerciseHistory(exercise.id), [exercise.id], []);

  return summarizeHistory(logs, exercise.exerciseType);
}

/**
 * Built-in library exercises come with correct muscle tags, so the editor is
 * only offered for custom ones. `undefined` while checking.
 */
export function useIsBuiltIn(title: string) {
  return useLiveQuery(() => isBuiltInExercise(title), [title]);
}
