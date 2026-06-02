import { db } from "../db.client";
import { WEEKDAYS } from "../../../shared/constants/weekdays";
import type { ExerciseTemplate, WorkoutDay } from "../models/exercise.model";
import type { WorkoutSetLog } from "../models/workout-log.model";
import { getDayBounds } from "../utils/getDayBounds";

export interface WeekPlanSummary {
  day: WorkoutDay;
  exerciseCount: number;
  plannedDurationMin?: number;
  totalSetsCount: number;
  completedSetsCount: number;
  progress: number;
}

export async function listWeekPlanSummaries() {
  const [exerciseTemplates, workoutLogs] = await Promise.all([
    db.exercises.toArray(),
    db.workoutLogs.toArray(),
  ]);

  const exerciseDayById = new Map<number, WorkoutDay>();
  const exercisesByDay = new Map<WorkoutDay, ExerciseTemplate[]>();

  for (const exercise of exerciseTemplates) {
    if (exercise.id == null) {
      continue;
    }

    exerciseDayById.set(exercise.id, exercise.day);

    const dayExercises = exercisesByDay.get(exercise.day) ?? [];
    dayExercises.push(exercise);
    exercisesByDay.set(exercise.day, dayExercises);
  }

  const logsByDay = new Map<WorkoutDay, WorkoutSetLog[]>();
  const latestWorkoutByDay = new Map<WorkoutDay, Date>();

  for (const log of workoutLogs) {
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
    buildWeekPlanSummary(
      day,
      exercisesByDay.get(day) ?? [],
      logsByDay.get(day) ?? [],
      latestWorkoutByDay.get(day),
    ),
  );
}

function buildWeekPlanSummary(
  day: WorkoutDay,
  exercises: ExerciseTemplate[],
  logs: WorkoutSetLog[],
  latestWorkout?: Date,
): WeekPlanSummary {
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

function countCompletedSetsForWorkoutDay(logs: WorkoutSetLog[], workoutDate: Date) {
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
