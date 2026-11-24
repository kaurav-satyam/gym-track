import { describe, expect, it } from "vitest";
import { db } from "@/data/db";
import { resetDatabaseBeforeEach } from "@/test/db";
import {
  createCustomExerciseLibraryItem,
  listExerciseLibraryCategories,
  listExerciseLibraryItems,
  seedExerciseLibrary,
} from "./exercise-library.repository";

resetDatabaseBeforeEach();

const seed = [
  { id: "bench", title: "Barbell Bench Press", exerciseType: "reps" as const, exerciseUnit: "kg" as const, muscleTags: ["Chest"], category: "Chest" },
  { id: "squat", title: "Barbell Squat", exerciseType: "reps" as const, exerciseUnit: "kg" as const, muscleTags: ["Quads"], category: "Legs" },
];

describe("exercise library repository", () => {
  it("seeding only inserts missing items and never overwrites edits", async () => {
    await seedExerciseLibrary(seed);
    await db.exerciseLibrary.update("bench", { exerciseUnit: "lb" });

    await seedExerciseLibrary(seed);

    expect(await db.exerciseLibrary.count()).toBe(2);
    expect((await db.exerciseLibrary.get("bench"))?.exerciseUnit).toBe("lb");
  });

  it("searches fuzzily and filters by category", async () => {
    await seedExerciseLibrary(seed);
    await createCustomExerciseLibraryItem({ title: "Zercher Squat", exerciseType: "reps", exerciseUnit: "kg" });

    const titles = (items: { title: string }[]) => items.map((item) => item.title);

    expect(titles(await listExerciseLibraryItems({ query: "bench" }))).toEqual(["Barbell Bench Press"]);
    expect(titles(await listExerciseLibraryItems({ query: "squat" }))).toContain("Zercher Squat");
    expect(titles(await listExerciseLibraryItems({ category: "Legs" }))).toEqual(["Barbell Squat"]);
    expect(await listExerciseLibraryCategories()).toEqual(["Chest", "Legs", "Other"]);
  });
});
