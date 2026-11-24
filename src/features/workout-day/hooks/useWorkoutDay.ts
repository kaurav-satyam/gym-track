import { useLiveQuery } from "dexie-react-hooks";
import { listExercisesForDay } from "@/data/repositories/exercise.repository";
import {
  listCompletedSetIdsForDay,
  listLatestLogsBySetId,
} from "@/data/repositories/workout-log.repository";
import { isPersisted, type WorkoutDay } from "@/domain/models/exercise";
import type { WorkoutSetLog } from "@/domain/models/workout-log";
import { getWorkoutDayStatus } from "@/domain/workout-day";

const NO_COMPLETIONS: ReadonlySet<string> = new Set();
const NO_LOGS: ReadonlyMap<string, WorkoutSetLog> = new Map();

/**
 * Everything the workout-day screen reads: the day's exercises, which sets
 * are done today, each set's last logged values, and the overall status.
 * `exercises` is undefined while loading.
 */
export function useWorkoutDay(day: WorkoutDay) {
  const exercises = useLiveQuery(
    async () => (await listExercisesForDay(day)).filter(isPersisted),
    [day],
  );

  // Keyed on exercise/set ids only, so typing new values into a set doesn't
  // re-run the log queries. Logging a set still updates via Dexie's observers.
  const structureKey = JSON.stringify(
    (exercises ?? []).map((exercise) => [exercise.id, exercise.exerciseSets.map((set) => set.id)]),
  );
  const logState = useLiveQuery(async () => {
    const structure = JSON.parse(structureKey) as Array<[number, string[]]>;
    const [completedSetIds, latestLogBySetId] = await Promise.all([
      listCompletedSetIdsForDay(structure.map(([id]) => id)),
      listLatestLogsBySetId(structure.flatMap(([, setIds]) => setIds)),
    ]);

    return { completedSetIds, latestLogBySetId };
  }, [structureKey]);

  const completedSetIds: ReadonlySet<string> = logState?.completedSetIds ?? NO_COMPLETIONS;

  return {
    exercises,
    completedSetIds,
    latestLogBySetId: (logState?.latestLogBySetId ?? NO_LOGS) as ReadonlyMap<string, WorkoutSetLog>,
    status: getWorkoutDayStatus(exercises ?? [], completedSetIds),
  };
}
