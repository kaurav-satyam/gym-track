import { describe, expect, it } from "vitest";
import { at, exercise, log, set } from "@/test/fixtures";
import { buildProgressSummary, getWeekRange, isCurrentWeek, shiftWeek } from "./progress";

// Week of Sun 22 Nov – Sat 28 Nov 2026.
const anchor = at(2026, 11, 24);

describe("week ranges", () => {
  it("weeks run Sunday to Saturday", () => {
    const range = getWeekRange(anchor);

    expect(range.start).toEqual(at(2026, 11, 22, 0));
    expect(range.end.getDate()).toBe(28);
  });

  it("shifts and recognises the current week", () => {
    expect(shiftWeek(anchor, -1)).toEqual(at(2026, 11, 17));
    expect(isCurrentWeek(at(2026, 11, 28), anchor)).toBe(true);
    expect(isCurrentWeek(at(2026, 11, 21), anchor)).toBe(false);
  });
});

describe("buildProgressSummary", () => {
  const squat = exercise(1, "Sunday", {
    title: "Squat",
    muscleTags: ["Quads", "Glutes"],
    exerciseSets: [set({ weight: 100, reps: 5 }), set({ weight: 100, reps: 5 })],
  });
  const curl = exercise(2, "Tuesday", { title: "Curl", muscleTags: ["Biceps"] });

  const logs = [
    log(squat, 0, at(2026, 11, 22, 18)),
    log(squat, 1, at(2026, 11, 22, 18, 3), { weight: 110 }),
    // Outside the week: ignored.
    log(squat, 0, at(2026, 11, 15, 18)),
    // Exercise that no longer exists: ignored.
    { exerciseId: 99, exerciseSetId: "gone", completedAt: at(2026, 11, 23), weight: 10, reps: 10 },
  ];
  const summary = buildProgressSummary({ anchorDate: anchor, exercises: [squat, curl], logs });

  it("totals planned vs completed sets", () => {
    expect(summary.plannedSets).toBe(3); // 2 on Sunday + 1 on Tuesday
    expect(summary.completedSets).toBe(2);
    expect(summary.activeDays).toBe(1);
  });

  it("has one entry per day with planned and done counts", () => {
    expect(summary.days).toHaveLength(7);
    expect(summary.days[0]).toMatchObject({ plannedSets: 2, completedSets: 2 });
    expect(summary.days[2]).toMatchObject({ plannedSets: 1, completedSets: 0 });
  });

  it("ranks muscles and exercises by completed sets", () => {
    expect(summary.muscleStats).toEqual([
      { tag: "Glutes", completedSets: 2 },
      { tag: "Quads", completedSets: 2 },
    ]);
    expect(summary.exerciseStats.map((stat) => [stat.title, stat.completedSets, stat.bestSetValue])).toEqual([
      ["Squat", 2, 110],
      ["Curl", 0, 0],
    ]);
  });
});
