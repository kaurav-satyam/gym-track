import type { WorkoutSetLog } from "../../../app/db/models/workout-log.model";

export type TGroupedExerciseHistory = Record<string, WorkoutSetLog[]>;

export default function groupExerciseHistoryByDate(
  exerciseHistory: WorkoutSetLog[],
): TGroupedExerciseHistory {
  return exerciseHistory.reduce<TGroupedExerciseHistory>((accumulator, log) => {
    const date = log.completedAt.toDateString();

    if (!accumulator[date]) {
      accumulator[date] = [];
    }

    accumulator[date].push(log);

    return accumulator;
  }, {});
}
