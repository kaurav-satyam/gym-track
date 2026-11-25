import { describe, expect, it } from "vitest";
import { db } from "@/data/db";
import { at } from "@/test/fixtures";
import { resetDatabaseBeforeEach } from "@/test/db";
import { createBackup, parseBackup, restoreBackup, serializeBackup } from "./backup";
import { createExerciseTemplate } from "./repositories/exercise.repository";
import { createCustomExerciseLibraryItem } from "./repositories/exercise-library.repository";
import { logExerciseSetCompletion } from "./repositories/workout-log.repository";

resetDatabaseBeforeEach();

describe("backup", () => {
  it("round-trips all data through JSON, including dates", async () => {
    const set = { id: "s1", weight: 60, reps: 8 };
    const id = await createExerciseTemplate({
      day: "Monday",
      title: "Bench",
      exerciseType: "reps",
      exerciseUnit: "kg",
      muscleTags: ["Chest"],
      exerciseSets: [set],
    });
    await logExerciseSetCompletion(id, set, at(2026, 11, 23, 18));
    await createCustomExerciseLibraryItem({ title: "Zercher Squat", exerciseType: "reps", exerciseUnit: "kg" });

    const text = serializeBackup(await createBackup());

    // Wipe, then restore from the file contents.
    await db.exercises.clear();
    await db.workoutLogs.clear();
    await restoreBackup(parseBackup(text));

    const [log] = await db.workoutLogs.toArray();
    expect((await db.exercises.get(id))?.title).toBe("Bench");
    expect(log.completedAt).toBeInstanceOf(Date);
    expect(log.completedAt).toEqual(at(2026, 11, 23, 18));
    expect(await db.exerciseLibrary.count()).toBe(1);
  });

  it("rejects files that aren't backups", () => {
    expect(() => parseBackup("not json")).toThrow("isn't a GymTrack backup");
    expect(() => parseBackup('{"hello":1}')).toThrow("isn't a GymTrack backup");
    expect(() =>
      parseBackup('{"format":"gymtrack-backup","version":99,"exercises":[],"workoutLogs":[]}'),
    ).toThrow("newer version");
  });
});
