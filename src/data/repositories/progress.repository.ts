import { db } from "@/data/db";
import { startOfWeek } from "@/domain/dates";
import {
  buildProgressSummary,
  getProgressRange,
  type ProgressPeriod,
} from "@/domain/progress";
import { summarizeWeek } from "@/domain/week-progress";

/** Stats for the Progress tab: one week or month around `anchorDate`. */
export async function getProgressSummary(period: ProgressPeriod, anchorDate: Date) {
  const { start, end } = getProgressRange(period, anchorDate);
  const [exercises, logs] = await Promise.all([
    db.exercises.toArray(),
    db.workoutLogs.where("completedAt").between(start, end, true, true).toArray(),
  ]);

  return buildProgressSummary({ period, anchorDate, exercises, logs });
}

/** This week's per-day progress (resets every Sunday) for the day strip. */
export async function getWeekProgress(now = new Date()) {
  const [exercises, weekLogs] = await Promise.all([
    db.exercises.toArray(),
    db.workoutLogs.where("completedAt").aboveOrEqual(startOfWeek(now)).toArray(),
  ]);

  return summarizeWeek(exercises, weekLogs);
}
