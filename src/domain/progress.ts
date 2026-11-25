import {
  addDays,
  eachDay,
  endOfDay,
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
 * Pure weekly statistics for the Progress tab. The repository loads
 * exercises and logs; everything here is plain data in, plain data out.
 */

export interface WeekRange {
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
  /** Heaviest weight, or longest time for timed exercises. 0 when nothing is logged. */
  bestSetValue: number;
}

export interface ProgressSummary {
  range: WeekRange;
  plannedSets: number;
  completedSets: number;
  activeDays: number;
  days: ProgressDay[];
  muscleStats: MuscleStat[];
  exerciseStats: ExerciseStat[];
}

/** Sunday–Saturday week containing `anchorDate`. */
export function getWeekRange(anchorDate: Date): WeekRange {
  const start = startOfWeek(anchorDate);
  const end = endOfDay(addDays(start, 6));

  return { start, end, label: `${formatShortDate(start)} - ${formatShortDate(end)}` };
}

/** Moves the anchor one week back (-1) or forward (1). */
export function shiftWeek(date: Date, direction: -1 | 1) {
  return addDays(date, direction * 7);
}

export function isCurrentWeek(anchorDate: Date, now = new Date()) {
  return startOfWeek(anchorDate).getTime() === startOfWeek(now).getTime();
}

/**
 * Builds the summary for the week around `anchorDate`.
 *
 * - Planned sets: every day counts the sets of exercises scheduled on that
 *   weekday (current templates).
 * - Completed sets: logs inside the week whose exercise still exists.
 */
export function buildProgressSummary({
  anchorDate,
  exercises,
  logs,
}: {
  anchorDate: Date;
  exercises: ExerciseTemplate[];
  logs: WorkoutSetLog[];
}): ProgressSummary {
  const range = getWeekRange(anchorDate);
  const persisted = exercises.filter(isPersisted);
  const exercisesById = new Map(persisted.map((exercise) => [exercise.id, exercise]));
  const weekLogs = logs.filter(
    (log) =>
      exercisesById.has(log.exerciseId) &&
      log.completedAt >= range.start &&
      log.completedAt <= range.end,
  );
  const days = eachDay(range.start, range.end).map((date) => buildDay(date, persisted, weekLogs));

  return {
    range,
    plannedSets: sum(days.map((day) => day.plannedSets)),
    completedSets: weekLogs.length,
    activeDays: new Set(weekLogs.map((log) => toDateKey(log.completedAt))).size,
    days,
    muscleStats: buildMuscleStats(weekLogs, exercisesById),
    exerciseStats: buildExerciseStats(persisted, weekLogs),
  };
}

function buildDay(date: Date, exercises: PersistedExercise[], logs: WorkoutSetLog[]): ProgressDay {
  const { start, end } = getDayBounds(date);
  const weekday = WEEKDAYS[date.getDay()];

  return {
    key: toDateKey(date),
    label: date.toLocaleDateString([], { weekday: "short" }),
    plannedSets: sum(
      exercises.filter((exercise) => exercise.day === weekday).map((exercise) => exercise.exerciseSets.length),
    ),
    completedSets: logs.filter((log) => log.completedAt >= start && log.completedAt <= end).length,
  };
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
        // Each exercise is scheduled on one weekday.
        plannedSets: exercise.exerciseSets.length,
        completedSets: exerciseLogs.length,
        bestSetValue: Math.max(0, ...exerciseLogs.map((log) => log[field] ?? 0)),
      };
    })
    .filter((stat) => stat.plannedSets > 0 || stat.completedSets > 0)
    .sort(
      (left, right) =>
        right.completedSets - left.completedSets || left.title.localeCompare(right.title),
    );
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}
