import { db } from "@/data/db";
import { startOfWeek } from "@/domain/dates";
import { buildProgressSummary, getWeekRange } from "@/domain/progress";
import { summarizeWeek } from "@/domain/week-progress";

/** Stats for the Progress tab: the Sunday–Saturday week around `anchorDate`. */
export async function getProgressSummary(anchorDate: Date) {
  const { start, end } = getWeekRange(anchorDate);
  const [exercises, logs] = await Promise.all([
    db.exercises.toArray(),
    db.workoutLogs.where("completedAt").between(start, end, true, true).toArray(),
  ]);

  return buildProgressSummary({ anchorDate, exercises, logs });
}

/** This week's per-day progress (resets every Sunday) for the day strip. */
export async function getWeekProgress(now = new Date()) {
  const [exercises, weekLogs] = await Promise.all([
    db.exercises.toArray(),
    db.workoutLogs.where("completedAt").aboveOrEqual(startOfWeek(now)).toArray(),
  ]);

  return summarizeWeek(exercises, weekLogs);
}
