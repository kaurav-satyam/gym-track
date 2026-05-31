import { db } from "..";

import type { IExerciseTable, TDay } from "../table/exercise.table";

export type IAddExercisePayload = Omit<IExerciseTable, "id">;

export class ExerciseService {
  /**
   * Add Exercise
   */
  static async addExercise(payload: IAddExercisePayload) {
    try {
      const id = await db.exercises.add({
        ...payload,
      });

      return id;
    } catch (error) {
      console.error("Failed to add exercise", error);

      throw error;
    }
  }

  /**
   * Remove Exercise
   */
  static async removeExercise(id: number) {
    try {
      await db.exercises.delete(id);
    } catch (error) {
      console.error("Failed to remove exercise", error);

      throw error;
    }
  }

  /**
   * Get All Exercises
   */
  static async getExercises() {
    try {
      return await db.exercises.toArray();
    } catch (error) {
      console.error("Failed to fetch exercises", error);

      throw error;
    }
  }

  /**
   * Get Exercises By Day
   */
  static async getExercisesByDay(day: TDay) {
    try {
      return await db.exercises.where("day").equals(day).toArray();
    } catch (error) {
      console.error("Failed to fetch exercises by day", error);

      throw error;
    }
  }

  /**
   * Update Exercise
   */
  static async updateExercise(id: number, payload: Partial<IExerciseTable>) {
    try {
      await db.exercises.update(id, payload);
    } catch (error) {
      console.error("Failed to update exercise", error);

      throw error;
    }
  }
}
