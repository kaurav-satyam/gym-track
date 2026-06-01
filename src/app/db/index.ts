import Dexie, { type EntityTable } from "dexie";
import { ExerciseSchema, type IExerciseTable } from "./table/exercise.table";
import { WorkoutSetLogSchema, type IWorkoutSetLog } from "./table/workout-log.table";

class GymTrackDatabase extends Dexie {
  exercises!: EntityTable<IExerciseTable, "id">;
  workoutLogs!: EntityTable<IWorkoutSetLog, "id">;

  constructor() {
    super("GymTrack");

    this.version(1).stores({
      exercises: ExerciseSchema,
      workoutlogs: WorkoutSetLogSchema,
    });

    this.exercises = this.table("exercises");
    this.workoutLogs = this.table("workoutlogs");
  }
}

export const db = new GymTrackDatabase();
