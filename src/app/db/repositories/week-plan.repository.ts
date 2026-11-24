import { db } from "../db.client";
import { WEEKDAYS } from "../../../shared/constants/weekdays";
import type { ExerciseTemplate, WorkoutDay } from "../models/exercise.model";
import type { WorkoutSetLog } from "../models/workout-log.model";

export interface WeekPlanSummary {
  day: WorkoutDay;
  exerciseCount: number;
  plannedDurationMin?: number;
  totalSetsCount: number;
  completedSetsCount: number;
  progress: number;
}

/** Start of the current week (Sunday 00:00 local). Progress resets here. */
export function getWeekStart(date = new Date()) {
  const start = new Date(date);

  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  return start;
}

export async function listWeekPlanSummaries() {
  const weekStart = getWeekStart();
  const [exerciseTemplates, workoutLogs] = await Promise.all([
    db.exercises.toArray(),
    db.workoutLogs.where("completedAt").aboveOrEqual(weekStart).toArray(),
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

  const completedSetIdsByDay = new Map<WorkoutDay, Set<string>>();

  for (const log of workoutLogs) {
    const day = exerciseDayById.get(log.exerciseId);

    if (!day) {
      continue;
    }

    addCompletedSet(completedSetIdsByDay, day, log);
  }

  return WEEKDAYS.map((day) =>
    buildWeekPlanSummary(
      day,
      exercisesByDay.get(day) ?? [],
      completedSetIdsByDay.get(day),
    ),
  );
}

function addCompletedSet(
  completedSetIdsByDay: Map<WorkoutDay, Set<string>>,
  day: WorkoutDay,
  log: WorkoutSetLog,
) {
  const setIds = completedSetIdsByDay.get(day) ?? new Set<string>();

  setIds.add(log.exerciseSetId);
  completedSetIdsByDay.set(day, setIds);
}

function buildWeekPlanSummary(
  day: WorkoutDay,
  exercises: ExerciseTemplate[],
  completedSetIds: Set<string> = new Set(),
): WeekPlanSummary {
  const totalSetsCount = exercises.reduce(
    (sum, exercise) => sum + exercise.exerciseSets.length,
    0,
  );
  const plannedDurationMin = exercises.reduce(
    (sum, exercise) => sum + (exercise.plannedDurationMin ?? 0),
    0,
  );
  // Logs of since-deleted template sets stay in history but aren't progress.
  const clampedCompleted = exercises.reduce(
    (sum, exercise) =>
      sum + exercise.exerciseSets.filter((set) => completedSetIds.has(set.id)).length,
    0,
  );

  return {
    day,
    exerciseCount: exercises.length,
    plannedDurationMin: plannedDurationMin > 0 ? plannedDurationMin : undefined,
    totalSetsCount,
    completedSetsCount: clampedCompleted,
    progress:
      totalSetsCount > 0
        ? Math.round((clampedCompleted / totalSetsCount) * 100)
        : 0,
  };
}
