import { WEEKDAYS } from "../../../shared/constants/weekdays";
import { db } from "../db.client";
import type {
  ExerciseTemplate,
  ExerciseType,
} from "../models/exercise.model";
import type { WorkoutSetLog } from "../models/workout-log.model";
import { getDayBounds } from "../utils/getDayBounds";

export type AnalyticsPeriod = "day" | "week" | "month";
export type AnalyticsTypeFilter = ExerciseType | "all";

export interface AnalyticsFilters {
  period: AnalyticsPeriod;
  anchorDate: Date;
  muscleTag?: string;
  exerciseId?: number;
  exerciseType?: AnalyticsTypeFilter;
}

export interface AnalyticsRange {
  start: Date;
  end: Date;
  label: string;
}

export interface AnalyticsTrendPoint {
  key: string;
  label: string;
  plannedSets: number;
  completedSets: number;
  loadVolume: number;
  timeSeconds: number;
}

export interface AnalyticsMuscleStat {
  tag: string;
  completedSets: number;
  loadVolume: number;
  timeSeconds: number;
}

export interface AnalyticsExerciseStat {
  exerciseId: number;
  title: string;
  muscleTags: string[];
  exerciseType: ExerciseType;
  exerciseUnit: string;
  plannedSets: number;
  completedSets: number;
  loadVolume: number;
  timeSeconds: number;
  bestSetValue: number;
  lastCompletedAt?: Date;
}

export interface AnalyticsSummary {
  range: AnalyticsRange;
  plannedSets: number;
  completedSets: number;
  completionPercent: number;
  loadVolume: number;
  timeSeconds: number;
  activeDays: number;
  exerciseCount: number;
  trend: AnalyticsTrendPoint[];
  muscleStats: AnalyticsMuscleStat[];
  exerciseStats: AnalyticsExerciseStat[];
  muscleOptions: string[];
  exerciseOptions: Array<{ id: number; title: string }>;
}

interface BucketDefinition {
  key: string;
  label: string;
  start: Date;
  end: Date;
}

export async function getAnalyticsSummary({
  period,
  anchorDate,
  muscleTag = "all",
  exerciseId,
  exerciseType = "all",
}: AnalyticsFilters): Promise<AnalyticsSummary> {
  const range = getAnalyticsRange(period, anchorDate);
  const buckets = getBuckets(period, range.start, range.end);
  const [allExercises, workoutLogs] = await Promise.all([
    db.exercises.toArray(),
    db.workoutLogs
      .where("completedAt")
      .between(range.start, range.end, true, true)
      .toArray(),
  ]);
  const exercisesById = new Map(
    allExercises
      .filter(
        (exercise): exercise is ExerciseTemplate & { id: number } =>
          exercise.id != null,
      )
      .map((exercise) => [exercise.id, exercise]),
  );
  const filteredExercises = allExercises.filter((exercise) =>
    matchesExerciseFilters(exercise, { muscleTag, exerciseId, exerciseType }),
  );
  const filteredExerciseIds = new Set(
    filteredExercises
      .filter(
        (exercise): exercise is ExerciseTemplate & { id: number } =>
          exercise.id != null,
      )
      .map((exercise) => exercise.id),
  );
  const filteredLogs = workoutLogs.filter((log) => {
    const exercise = exercisesById.get(log.exerciseId);

    return exercise != null && filteredExerciseIds.has(log.exerciseId);
  });
  const trend = buckets.map((bucket) =>
    buildTrendPoint(bucket, filteredExercises, filteredLogs, exercisesById),
  );
  const plannedSets = trend.reduce(
    (total, point) => total + point.plannedSets,
    0,
  );
  const completedSets = filteredLogs.length;
  const completionPercent =
    plannedSets === 0 ? 0 : (completedSets / plannedSets) * 100;
  const loadVolume = filteredLogs.reduce(
    (total, log) => total + calculateLoadVolume(log),
    0,
  );
  const timeSeconds = filteredLogs.reduce((total, log) => {
    const exercise = exercisesById.get(log.exerciseId);

    return total + calculateTimeSeconds(log, exercise);
  }, 0);
  const activeDays = new Set(
    filteredLogs.map((log) => toDateKey(log.completedAt)),
  ).size;

  return {
    range,
    plannedSets,
    completedSets,
    completionPercent,
    loadVolume,
    timeSeconds,
    activeDays,
    exerciseCount: filteredExercises.length,
    trend,
    muscleStats: buildMuscleStats(filteredLogs, exercisesById),
    exerciseStats: buildExerciseStats(filteredExercises, filteredLogs, range),
    muscleOptions: listMuscleOptions(allExercises),
    exerciseOptions: listExerciseOptions(allExercises),
  };
}

export function shiftAnalyticsDate(
  date: Date,
  period: AnalyticsPeriod,
  direction: -1 | 1,
) {
  const nextDate = new Date(date);

  if (period === "day") {
    nextDate.setDate(nextDate.getDate() + direction);
  } else if (period === "week") {
    nextDate.setDate(nextDate.getDate() + direction * 7);
  } else {
    nextDate.setMonth(nextDate.getMonth() + direction);
  }

  return nextDate;
}

export function getAnalyticsRange(
  period: AnalyticsPeriod,
  anchorDate: Date,
): AnalyticsRange {
  if (period === "day") {
    const { start, end } = getDayBounds(anchorDate);

    return {
      start,
      end,
      label: formatDate(start),
    };
  }

  if (period === "week") {
    const start = startOfWeek(anchorDate);
    const end = endOfDay(addDays(start, 6));

    return {
      start,
      end,
      label: `${formatShortDate(start)} - ${formatShortDate(end)}`,
    };
  }

  const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const end = endOfDay(
    new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0),
  );

  return {
    start,
    end,
    label: start.toLocaleDateString([], { month: "long", year: "numeric" }),
  };
}

function buildTrendPoint(
  bucket: BucketDefinition,
  exercises: ExerciseTemplate[],
  logs: WorkoutSetLog[],
  exercisesById: Map<number, ExerciseTemplate>,
): AnalyticsTrendPoint {
  const bucketLogs = logs.filter(
    (log) =>
      log.completedAt.getTime() >= bucket.start.getTime() &&
      log.completedAt.getTime() <= bucket.end.getTime(),
  );
  const plannedSets = countPlannedSetsForRange(
    exercises,
    bucket.start,
    bucket.end,
  );

  return {
    key: bucket.key,
    label: bucket.label,
    plannedSets,
    completedSets: bucketLogs.length,
    loadVolume: bucketLogs.reduce(
      (total, log) => total + calculateLoadVolume(log),
      0,
    ),
    timeSeconds: bucketLogs.reduce((total, log) => {
      const exercise = exercisesById.get(log.exerciseId);

      return total + calculateTimeSeconds(log, exercise);
    }, 0),
  };
}

function buildMuscleStats(
  logs: WorkoutSetLog[],
  exercisesById: Map<number, ExerciseTemplate>,
) {
  const statsByTag = new Map<string, AnalyticsMuscleStat>();

  for (const log of logs) {
    const exercise = exercisesById.get(log.exerciseId);
    const tags = exercise?.muscleTags?.length
      ? exercise.muscleTags
      : ["Untagged"];

    for (const tag of tags) {
      const stat = statsByTag.get(tag) ?? {
        tag,
        completedSets: 0,
        loadVolume: 0,
        timeSeconds: 0,
      };

      stat.completedSets += 1;
      stat.loadVolume += calculateLoadVolume(log);
      stat.timeSeconds += calculateTimeSeconds(log, exercise);
      statsByTag.set(tag, stat);
    }
  }

  return [...statsByTag.values()].sort(
    (left, right) =>
      right.completedSets - left.completedSets || left.tag.localeCompare(right.tag),
  );
}

function buildExerciseStats(
  exercises: ExerciseTemplate[],
  logs: WorkoutSetLog[],
  range: AnalyticsRange,
): AnalyticsExerciseStat[] {
  const logsByExerciseId = new Map<number, WorkoutSetLog[]>();

  for (const log of logs) {
    logsByExerciseId.set(log.exerciseId, [
      ...(logsByExerciseId.get(log.exerciseId) ?? []),
      log,
    ]);
  }

  return exercises
    .filter(
      (exercise): exercise is ExerciseTemplate & { id: number } =>
        exercise.id != null,
    )
    .map((exercise) => {
      const exerciseLogs = logsByExerciseId.get(exercise.id) ?? [];
      const sortedLogs = [...exerciseLogs].sort(
        (left, right) =>
          right.completedAt.getTime() - left.completedAt.getTime(),
      );
      const loadVolume = exerciseLogs.reduce(
        (total, log) => total + calculateLoadVolume(log),
        0,
      );
      const timeSeconds = exerciseLogs.reduce(
        (total, log) => total + calculateTimeSeconds(log, exercise),
        0,
      );

      return {
        exerciseId: exercise.id,
        title: exercise.title,
        muscleTags: exercise.muscleTags ?? [],
        exerciseType: exercise.exerciseType,
        exerciseUnit: exercise.exerciseUnit,
        plannedSets: countPlannedSetsForRange([exercise], range.start, range.end),
        completedSets: exerciseLogs.length,
        loadVolume,
        timeSeconds,
        bestSetValue: getBestSetValue(exercise, exerciseLogs),
        lastCompletedAt: sortedLogs[0]?.completedAt,
      };
    })
    .filter((exercise) => exercise.plannedSets > 0 || exercise.completedSets > 0)
    .sort(
      (left, right) =>
        right.completedSets - left.completedSets ||
        right.loadVolume - left.loadVolume ||
        left.title.localeCompare(right.title),
    );
}

function countPlannedSetsForRange(
  exercises: ExerciseTemplate[],
  start: Date,
  end: Date,
) {
  let count = 0;

  for (const date of eachDay(start, end)) {
    const dayName = WEEKDAYS[date.getDay()];

    count += exercises
      .filter((exercise) => exercise.day === dayName)
      .reduce((total, exercise) => total + exercise.exerciseSets.length, 0);
  }

  return count;
}

function matchesExerciseFilters(
  exercise: ExerciseTemplate,
  filters: Pick<AnalyticsFilters, "muscleTag" | "exerciseId" | "exerciseType">,
) {
  if (filters.exerciseId != null && exercise.id !== filters.exerciseId) {
    return false;
  }

  if (
    filters.exerciseType &&
    filters.exerciseType !== "all" &&
    exercise.exerciseType !== filters.exerciseType
  ) {
    return false;
  }

  if (
    filters.muscleTag &&
    filters.muscleTag !== "all" &&
    !(exercise.muscleTags ?? []).includes(filters.muscleTag)
  ) {
    return false;
  }

  return true;
}

function getBuckets(
  period: AnalyticsPeriod,
  start: Date,
  end: Date,
): BucketDefinition[] {
  if (period === "day") {
    return [
      {
        key: toDateKey(start),
        label: "Day",
        start,
        end,
      },
    ];
  }

  return eachDay(start, end).map((date) => {
    const { start: dayStart, end: dayEnd } = getDayBounds(date);

    return {
      key: toDateKey(date),
      label:
        period === "week"
          ? date.toLocaleDateString([], { weekday: "short" })
          : String(date.getDate()),
      start: dayStart,
      end: dayEnd,
    };
  });
}

function listMuscleOptions(exercises: ExerciseTemplate[]) {
  return [...new Set(exercises.flatMap((exercise) => exercise.muscleTags ?? []))].sort(
    (left, right) => left.localeCompare(right),
  );
}

function listExerciseOptions(exercises: ExerciseTemplate[]) {
  return exercises
    .filter(
      (exercise): exercise is ExerciseTemplate & { id: number } =>
        exercise.id != null,
    )
    .map((exercise) => ({ id: exercise.id, title: exercise.title }))
    .sort((left, right) => left.title.localeCompare(right.title));
}

function calculateLoadVolume(log: WorkoutSetLog) {
  return (log.weight ?? 0) * (log.reps ?? 0);
}

function calculateTimeSeconds(log: WorkoutSetLog, exercise?: ExerciseTemplate) {
  if (exercise?.exerciseType !== "time") {
    return 0;
  }

  const value = log.time ?? 0;

  if (exercise.exerciseUnit === "hr") {
    return value * 3600;
  }

  if (exercise.exerciseUnit === "min") {
    return value * 60;
  }

  return value;
}

function getBestSetValue(exercise: ExerciseTemplate, logs: WorkoutSetLog[]) {
  if (exercise.exerciseType === "time") {
    return logs.reduce((best, log) => Math.max(best, log.time ?? 0), 0);
  }

  return logs.reduce((best, log) => Math.max(best, log.weight ?? 0), 0);
}

function eachDay(start: Date, end: Date) {
  const days: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const finalDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (cursor.getTime() <= finalDate.getTime()) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());

  return getDayBounds(start).start;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function endOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);

  return nextDate;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}
