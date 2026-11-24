import Dexie, { type EntityTable } from "dexie";
import type { ExerciseLibraryItem } from "@/domain/models/exercise-library";
import type { ExerciseTemplate } from "@/domain/models/exercise";
import type { WorkoutSetLog } from "@/domain/models/workout-log";
import {
  EXERCISE_LIBRARY_SCHEMA,
  EXERCISE_SCHEMA,
  LEGACY_EXERCISE_LIBRARY_SCHEMA,
  LEGACY_EXERCISE_SCHEMA,
  WORKOUT_SET_LOG_SCHEMA,
} from "./schema";

/**
 * The app's single IndexedDB database ("GymTrack"). Only `src/data/` may
 * import this; everything else goes through the repositories.
 *
 * Versions are append-only. Never edit an old version; add a new one (with an
 * `.upgrade()` when data must change) so existing installs migrate:
 *   v1  exercises + workoutlogs
 *   v2  exercises.sortOrder (backfilled per day)
 *   v3  exerciseLibrary
 *   v4  exerciseLibrary drops `equipment`
 */
class GymTrackDatabase extends Dexie {
  exercises!: EntityTable<ExerciseTemplate, "id">;
  exerciseLibrary!: EntityTable<ExerciseLibraryItem, "id">;
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

    this.version(3).stores({
      exercises: EXERCISE_SCHEMA,
      exerciseLibrary: LEGACY_EXERCISE_LIBRARY_SCHEMA,
      workoutlogs: WORKOUT_SET_LOG_SCHEMA,
    });

    this.version(4)
      .stores({
        exercises: EXERCISE_SCHEMA,
        exerciseLibrary: EXERCISE_LIBRARY_SCHEMA,
        workoutlogs: WORKOUT_SET_LOG_SCHEMA,
      })
      .upgrade(async (transaction) => {
        const exerciseLibraryTable = transaction.table("exerciseLibrary");
        const exercises = (await exerciseLibraryTable.toArray()) as Array<{
          id: string;
          equipment?: string;
        }>;

        for (const exercise of exercises) {
          await exerciseLibraryTable.update(exercise.id, {
            equipment: undefined,
          });
        }
      });

    this.exercises = this.table("exercises");
    this.exerciseLibrary = this.table("exerciseLibrary");
    this.workoutLogs = this.table("workoutlogs");
  }
}

export const db = new GymTrackDatabase();
