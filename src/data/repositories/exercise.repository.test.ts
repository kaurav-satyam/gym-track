import { describe, expect, it } from "vitest";
import { db } from "@/data/db";
import { resetDatabaseBeforeEach } from "@/test/db";
import {
  addExerciseTemplateSet,
  addLibraryExerciseToDay,
  createExerciseTemplate,
  listExercisesForDay,
  moveExerciseTemplate,
  removeExerciseSet,
  removeExerciseTemplate,
  updateExerciseTemplateSet,
} from "./exercise.repository";
import { logExerciseSetCompletion } from "./workout-log.repository";

resetDatabaseBeforeEach();

function create(title: string, day: "Monday" | "Tuesday" = "Monday") {
  return createExerciseTemplate({
    day,
    title,
    exerciseType: "reps",
    exerciseUnit: "kg",
    muscleTags: [],
    exerciseSets: [{ id: crypto.randomUUID(), weight: 50, reps: 10 }],
  });
}

describe("exercise repository", () => {
  it("appends new exercises to the end of their day and reorders them", async () => {
    const a = await create("A");
    await create("Other day", "Tuesday");
    const b = await create("B");

    expect((await listExercisesForDay("Monday")).map((item) => item.title)).toEqual(["A", "B"]);

    await moveExerciseTemplate(b, "up");
    expect((await listExercisesForDay("Monday")).map((item) => item.title)).toEqual(["B", "A"]);

    // Moving past the edge is a no-op.
    await moveExerciseTemplate(a, "down");
    expect((await listExercisesForDay("Monday")).map((item) => item.title)).toEqual(["B", "A"]);
  });

  it("copies the last set's values when adding a set", async () => {
    const id = await create("Bench");
    const [first] = (await db.exercises.get(id))!.exerciseSets;

    await addExerciseTemplateSet(id, first);
    const sets = (await db.exercises.get(id))!.exerciseSets;

    expect(sets).toHaveLength(2);
    expect(sets[1]).toMatchObject({ weight: 50, reps: 10 });
    expect(sets[1].id).not.toBe(first.id);
  });

  it("drops negative or non-finite set values", async () => {
    const id = await create("Bench");
    const [first] = (await db.exercises.get(id))!.exerciseSets;

    await updateExerciseTemplateSet(id, first.id, { weight: -5, reps: Number.NaN });

    expect((await db.exercises.get(id))!.exerciseSets[0]).toMatchObject({ weight: undefined, reps: undefined });
  });

  it("keeps history when a set is removed, but not when the exercise is deleted", async () => {
    const id = await create("Bench");
    const [first] = (await db.exercises.get(id))!.exerciseSets;
    await logExerciseSetCompletion(id, first);

    await removeExerciseSet(id, first.id);
    expect((await db.exercises.get(id))!.exerciseSets).toHaveLength(0);
    expect(await db.workoutLogs.count()).toBe(1);

    await removeExerciseTemplate(id);
    expect(await db.exercises.get(id)).toBeUndefined();
    expect(await db.workoutLogs.count()).toBe(0);
  });

  it("reuses the latest set values when adding a previously planned exercise", async () => {
    const libraryItem = { title: "Squat", exerciseType: "reps" as const, exerciseUnit: "kg" as const, muscleTags: ["Quads"] };

    const firstId = await addLibraryExerciseToDay("Monday", libraryItem);
    const first = (await db.exercises.get(firstId))!;
    expect(first.exerciseSets).toHaveLength(3);

    await updateExerciseTemplateSet(firstId, first.exerciseSets[0].id, { weight: 100, reps: 5 });

    const secondId = await addLibraryExerciseToDay("Tuesday", { ...libraryItem, title: " squat " });
    const second = (await db.exercises.get(secondId))!;

    expect(second.exerciseSets[0]).toMatchObject({ weight: 100, reps: 5 });
    expect(second.exerciseSets[0].id).not.toBe(first.exerciseSets[0].id);
  });
});
