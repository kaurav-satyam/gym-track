import { describe, expect, it } from "vitest";
import { db } from "@/data/db";
import { at } from "@/test/fixtures";
import { resetDatabaseBeforeEach } from "@/test/db";
import {
  listCompletedSetIdsForDay,
  listLatestLogsBySetId,
  logExerciseSetCompletion,
  removeExerciseSetCompletion,
} from "./workout-log.repository";

resetDatabaseBeforeEach();

const set = { id: "set-1", weight: 60, reps: 8 };

describe("workout log repository", () => {
  it("logs a set at most once per day, even on a double tap", async () => {
    const day = at(2026, 11, 24, 18);

    await Promise.all([logExerciseSetCompletion(1, set, day), logExerciseSetCompletion(1, set, day)]);
    await logExerciseSetCompletion(1, set, at(2026, 11, 24, 20));

    expect(await db.workoutLogs.count()).toBe(1);

    // A new day is a new completion.
    await logExerciseSetCompletion(1, set, at(2026, 11, 25, 18));
    expect(await db.workoutLogs.count()).toBe(2);
  });

  it("snapshots values so later template edits don't change history", async () => {
    await logExerciseSetCompletion(1, set, at(2026, 11, 24));
    set.weight = 70;

    const [stored] = await db.workoutLogs.toArray();
    expect(stored.weight).toBe(60);
    set.weight = 60;
  });

  it("undo removes only that day's completion", async () => {
    await logExerciseSetCompletion(1, set, at(2026, 11, 23));
    await logExerciseSetCompletion(1, set, at(2026, 11, 24));

    await removeExerciseSetCompletion(set.id, at(2026, 11, 24));

    expect(await listCompletedSetIdsForDay([1], at(2026, 11, 24))).toEqual(new Set());
    expect(await listCompletedSetIdsForDay([1], at(2026, 11, 23))).toEqual(new Set(["set-1"]));
  });

  it("finds the latest log per set", async () => {
    await logExerciseSetCompletion(1, { ...set, weight: 55 }, at(2026, 11, 20));
    await logExerciseSetCompletion(1, { ...set, weight: 60 }, at(2026, 11, 24));

    const latest = await listLatestLogsBySetId(["set-1", "never-logged"]);

    expect(latest.get("set-1")?.weight).toBe(60);
    expect(latest.has("never-logged")).toBe(false);
  });
});
