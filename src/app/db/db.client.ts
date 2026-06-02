import Dexie, { type EntityTable } from "dexie";
import type { ExerciseTemplate } from "./models/exercise.model";
import type { WorkoutSetLog } from "./models/workout-log.model";
import {
  EXERCISE_SCHEMA,
  LEGACY_EXERCISE_SCHEMA,
} from "./schema/exercise.schema";
import { WORKOUT_SET_LOG_SCHEMA } from "./schema/workout-log.schema";

class GymTrackDatabase extends Dexie {
  exercises!: EntityTable<ExerciseTemplate, "id">;
  workoutLogs!: EntityTable<WorkoutSetLog, "id">;

  constructor() {
    super("GymTrack");

    this.version(1).stores({
      exercises: LEGACY_EXERCISE_SCHEMA,
      workoutlogs: WORKOUT_SET_LOG_SCHEMA,
    });

    this.version(2)
      .stores({
        exercises: EXERCISE_SCHEMA,
        workoutlogs: WORKOUT_SET_LOG_SCHEMA,
      })
      .upgrade(async (transaction) => {
        const exerciseTable = transaction.table("exercises");
        const exercises = (await exerciseTable.toArray()) as ExerciseTemplate[];
        const exercisesByDay = new Map<string, ExerciseTemplate[]>();

        for (const exercise of exercises) {
          const dayExercises = exercisesByDay.get(exercise.day) ?? [];
          dayExercises.push(exercise);
          exercisesByDay.set(exercise.day, dayExercises);
        }

        for (const dayExercises of exercisesByDay.values()) {
          dayExercises.sort((left, right) => (right.id ?? 0) - (left.id ?? 0));

          for (const [index, exercise] of dayExercises.entries()) {
            if (exercise.id == null) {
              continue;
            }

            await exerciseTable.update(exercise.id, {
              sortOrder: index,
            });
          }
        }
      });

    this.exercises = this.table("exercises");
    this.workoutLogs = this.table("workoutlogs");
  }
}

export const db = new GymTrackDatabase();
