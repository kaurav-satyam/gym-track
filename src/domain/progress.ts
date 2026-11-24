import {
  addDays,
  eachDay,
  endOfDay,
  formatMonth,
  formatShortDate,
  getDayBounds,
  startOfWeek,
  toDateKey,
} from "@/domain/dates";
import {
  isPersisted,
  type ExerciseTemplate,
  type ExerciseUnit,
  type PersistedExercise,
} from "@/domain/models/exercise";
import type { WorkoutSetLog } from "@/domain/models/workout-log";
import { WEEKDAYS } from "@/domain/weekdays";

/**
 * Pure progress statistics for the Progress tab. The repository loads
 * exercises and logs; everything here is plain data in, plain data out.
 */

export type ProgressPeriod = "week" | "month";

export interface ProgressRange {
  start: Date;
  end: Date;
  label: string;
}

export interface ProgressDay {
  key: string;
  label: string;
  plannedSets: number;
  completedSets: number;
}

export interface MuscleStat {
  tag: string;
  completedSets: number;
}

export interface ExerciseStat {
  exerciseId: number;
  title: string;
  muscleTags: string[];
  exerciseUnit: ExerciseUnit;
  plannedSets: number;
  completedSets: number;
  loadVolume: number;
  /** Heaviest weight, or longest time for timed exercises. 0 when nothing is logged. */
  bestSetValue: number;
}

export interface ProgressSummary {
  range: ProgressRange;
  plannedSets: number;
  completedSets: number;
  /** Sum of weight × reps across logged sets. */
  loadVolume: number;
  activeDays: number;
  days: ProgressDay[];
  muscleStats: MuscleStat[];
  exerciseStats: ExerciseStat[];
}

export function getProgressRange(period: ProgressPeriod, anchorDate: Date): ProgressRange {
  if (period === "week") {
    const start = startOfWeek(anchorDate);
    const end = endOfDay(addDays(start, 6));

    return { start, end, label: `${formatShortDate(start)} - ${formatShortDate(end)}` };
  }

  const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const end = endOfDay(new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0));

  return { start, end, label: formatMonth(start) };
}

/** Moves the anchor one week or one month back (-1) or forward (1). */
export function shiftAnchorDate(date: Date, period: ProgressPeriod, direction: -1 | 1) {
  const next = new Date(date);

  if (period === "week") {
    next.setDate(next.getDate() + direction * 7);
  } else {
    next.setMonth(next.getMonth() + direction);
  }

  return next;
}

export function isCurrentRange(period: ProgressPeriod, anchorDate: Date, now = new Date()) {
  return getProgressRange(period, anchorDate).start.getTime() === getProgressRange(period, now).start.getTime();
}

/**
 * Builds the summary for one period.
 *
 * - Planned sets: every day in the range counts the sets of exercises
 *   scheduled on that weekday (current templates).
 * - Completed sets: logs inside the range whose exercise still exists.
 */
export function buildProgressSummary({
  period,
  anchorDate,
  exercises,
  logs,
}: {
  period: ProgressPeriod;
  anchorDate: Date;
  exercises: ExerciseTemplate[];
  logs: WorkoutSetLog[];
}): ProgressSummary {
  const range = getProgressRange(period, anchorDate);
  const persisted = exercises.filter(isPersisted);
  const exercisesById = new Map(persisted.map((exercise) => [exercise.id, exercise]));
  const rangeLogs = logs.filter(
    (log) =>
      exercisesById.has(log.exerciseId) &&
      log.completedAt >= range.start &&
      log.completedAt <= range.end,
  );
  const days = eachDay(range.start, range.end).map((date) =>
    buildDay(date, period, persisted, rangeLogs),
  );

  return {
    range,
    plannedSets: sum(days.map((day) => day.plannedSets)),
    completedSets: rangeLogs.length,
    loadVolume: sum(rangeLogs.map(calculateLoadVolume)),
    activeDays: new Set(rangeLogs.map((log) => toDateKey(log.completedAt))).size,
    days,
    muscleStats: buildMuscleStats(rangeLogs, exercisesById),
    exerciseStats: buildExerciseStats(persisted, rangeLogs, range),
  };
}

function calculateLoadVolume(log: WorkoutSetLog) {
  return (log.weight ?? 0) * (log.reps ?? 0);
}

function buildDay(
  date: Date,
  period: ProgressPeriod,
  exercises: PersistedExercise[],
  logs: WorkoutSetLog[],
): ProgressDay {
  const { start, end } = getDayBounds(date);

  return {
    key: toDateKey(date),
    label:
      period === "week"
        ? date.toLocaleDateString([], { weekday: "short" })
        : String(date.getDate()),
    plannedSets: countPlannedSets(exercises, date, date),
    completedSets: logs.filter((log) => log.completedAt >= start && log.completedAt <= end).length,
  };
}

function countPlannedSets(exercises: ExerciseTemplate[], start: Date, end: Date) {
  return sum(
    eachDay(start, end).map((date) => {
      const weekday = WEEKDAYS[date.getDay()];

      return sum(
        exercises
          .filter((exercise) => exercise.day === weekday)
          .map((exercise) => exercise.exerciseSets.length),
      );
    }),
  );
}

function buildMuscleStats(logs: WorkoutSetLog[], exercisesById: Map<number, ExerciseTemplate>) {
  const setsByTag = new Map<string, number>();

  for (const log of logs) {
    const tags = exercisesById.get(log.exerciseId)?.muscleTags;

    for (const tag of tags?.length ? tags : ["Untagged"]) {
      setsByTag.set(tag, (setsByTag.get(tag) ?? 0) + 1);
    }
  }

  return [...setsByTag]
    .map(([tag, completedSets]) => ({ tag, completedSets }))
    .sort((left, right) => right.completedSets - left.completedSets || left.tag.localeCompare(right.tag));
}

function buildExerciseStats(
  exercises: PersistedExercise[],
  logs: WorkoutSetLog[],
  range: ProgressRange,
): ExerciseStat[] {
  const logsByExercise = new Map<number, WorkoutSetLog[]>();

  for (const log of logs) {
    const exerciseLogs = logsByExercise.get(log.exerciseId);

    if (exerciseLogs) {
      exerciseLogs.push(log);
    } else {
      logsByExercise.set(log.exerciseId, [log]);
    }
  }

  return exercises
    .map((exercise) => {
      const exerciseLogs = logsByExercise.get(exercise.id) ?? [];
      const field = exercise.exerciseType === "time" ? "time" : "weight";

      return {
        exerciseId: exercise.id,
        title: exercise.title,
        muscleTags: exercise.muscleTags ?? [],
        exerciseUnit: exercise.exerciseUnit,
        plannedSets: countPlannedSets([exercise], range.start, range.end),
        completedSets: exerciseLogs.length,
        loadVolume: sum(exerciseLogs.map(calculateLoadVolume)),
        bestSetValue: Math.max(0, ...exerciseLogs.map((log) => log[field] ?? 0)),
      };
    })
    .filter((stat) => stat.plannedSets > 0 || stat.completedSets > 0)
    .sort(
      (left, right) =>
        right.completedSets - left.completedSets ||
        right.loadVolume - left.loadVolume ||
        left.title.localeCompare(right.title),
    );
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}
