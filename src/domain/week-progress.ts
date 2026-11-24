import type { ExerciseTemplate, WorkoutDay } from "@/domain/models/exercise";
import type { WorkoutSetLog } from "@/domain/models/workout-log";
import { WEEKDAYS } from "@/domain/weekdays";

export interface DayProgress {
  day: WorkoutDay;
  totalSets: number;
  /** Distinct template sets completed this week. Never exceeds `totalSets`. */
  completedSets: number;
}

/**
 * Per-weekday progress for the current week (pass only this week's logs).
 * Logs of since-deleted sets stay in history but don't count as progress.
 */
export function summarizeWeek(
  exercises: ExerciseTemplate[],
  weekLogs: WorkoutSetLog[],
): DayProgress[] {
  const completedSetIds = new Set(weekLogs.map((log) => log.exerciseSetId));

  return WEEKDAYS.map((day) => {
    const sets = exercises
      .filter((exercise) => exercise.day === day)
      .flatMap((exercise) => exercise.exerciseSets);

    return {
      day,
      totalSets: sets.length,
      completedSets: sets.filter((set) => completedSetIds.has(set.id)).length,
    };
  });
}
