import Dexie, { type EntityTable } from "dexie";
import { ExerciseSchema, type IExerciseTable } from "./table/exercise.table";
import {
  WorkoutSetLogSchema,
  type IWorkoutSetLog,
} from "./table/workout-log.table";

const db = new Dexie("GymTrack") as Dexie & {
  exercises: EntityTable<IExerciseTable, "id">;
  workoutlogs: EntityTable<IWorkoutSetLog, "id">;
};

db.version(1).stores({
  exercises: ExerciseSchema,
  workoutlogs: WorkoutSetLogSchema,
});

db.on("populate", async function () {
  try {
  } catch (error) {
    console.error("Not able to seed the initial data");
  }
  console.info("data seeding done");
});

export { db };
