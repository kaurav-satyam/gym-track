import { db } from "..";
import { WEEKDAYS } from "../../../data/weekday.data";
import type { IWorkoutSetLog } from "../table/workout-log.table";
import type { IExerciseTable, TDay } from "../table/exercise.table";
import { getDayBounds } from "../utils/date";

export interface IWeekdaySummary {
  day: TDay;
  exerciseCount: number;
  plannedDurationMin?: number;
  totalSetsCount: number;
  completedSetsCount: number;
  progress: number;
}

export async function listWeekdaySummaries() {
  const [exercises, logs] = await Promise.all([
    db.exercises.toArray(),
    db.workoutLogs.toArray(),
  ]);

  const exerciseDayById = new Map<number, TDay>();
  const exercisesByDay = new Map<TDay, IExerciseTable[]>();

  for (const exercise of exercises) {
    if (exercise.id == null) {
      continue;
    }

    exerciseDayById.set(exercise.id, exercise.day);

    const dayExercises = exercisesByDay.get(exercise.day) ?? [];
    dayExercises.push(exercise);
    exercisesByDay.set(exercise.day, dayExercises);
  }

  const logsByDay = new Map<TDay, IWorkoutSetLog[]>();
  const latestWorkoutByDay = new Map<TDay, Date>();

  for (const log of logs) {
    const day = exerciseDayById.get(log.exerciseId);

    if (!day) {
      continue;
    }

    const dayLogs = logsByDay.get(day) ?? [];
    dayLogs.push(log);
    logsByDay.set(day, dayLogs);

    const latestWorkout = latestWorkoutByDay.get(day);

    if (!latestWorkout || log.completedAt.getTime() > latestWorkout.getTime()) {
      latestWorkoutByDay.set(day, log.completedAt);
    }
  }

  return WEEKDAYS.map((day) =>
    buildWeekdaySummary(
      day,
      exercisesByDay.get(day) ?? [],
      logsByDay.get(day) ?? [],
      latestWorkoutByDay.get(day),
    ),
  );
}

function buildWeekdaySummary(
  day: TDay,
  exercises: IExerciseTable[],
  logs: IWorkoutSetLog[],
  latestWorkout?: Date,
): IWeekdaySummary {
  const exerciseCount = exercises.length;
  const totalSetsCount = exercises.reduce(
    (sum, exercise) => sum + exercise.exerciseSets.length,
    0,
  );
  const plannedDurationMin = exercises.reduce(
    (sum, exercise) => sum + (exercise.plannedDurationMin ?? 0),
    0,
  );

  const completedSetsCount = latestWorkout
    ? countCompletedSetsForWorkoutDay(logs, latestWorkout)
    : 0;

  return {
    day,
    exerciseCount,
    plannedDurationMin: plannedDurationMin > 0 ? plannedDurationMin : undefined,
    totalSetsCount,
    completedSetsCount,
    progress:
      totalSetsCount > 0
        ? Math.round((completedSetsCount / totalSetsCount) * 100)
        : 0,
  };
}

function countCompletedSetsForWorkoutDay(logs: IWorkoutSetLog[], workoutDate: Date) {
  const { start, end } = getDayBounds(workoutDate);
  const completedSetIds = new Set(
    logs
      .filter(
        (log) =>
          log.completedAt.getTime() >= start.getTime() &&
          log.completedAt.getTime() <= end.getTime(),
      )
      .map((log) => log.exerciseSetId),
  );

  return completedSetIds.size;
}
