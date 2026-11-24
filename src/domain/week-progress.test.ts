import { describe, expect, it } from "vitest";
import { at, exercise, log, set } from "@/test/fixtures";
import { summarizeWeek } from "./week-progress";
import { getWorkoutDayStatus } from "./workout-day";

describe("summarizeWeek", () => {
  it("counts distinct completed template sets per weekday", () => {
    const squat = exercise(1, "Sunday", { exerciseSets: [set(), set()] });
    const week = summarizeWeek(
      [squat],
      [log(squat, 0, at(2026, 11, 22)), log(squat, 0, at(2026, 11, 22, 19))],
    );

    expect(week.find((day) => day.day === "Sunday")).toEqual({ day: "Sunday", totalSets: 2, completedSets: 1 });
    expect(week.find((day) => day.day === "Monday")).toEqual({ day: "Monday", totalSets: 0, completedSets: 0 });
  });

  it("ignores logs of sets that were deleted from the template", () => {
    const squat = exercise(1, "Sunday");
    const week = summarizeWeek([squat], [{ exerciseId: 1, exerciseSetId: "deleted", completedAt: at(2026, 11, 22) }]);

    expect(week[0].completedSets).toBe(0);
  });
});

describe("getWorkoutDayStatus", () => {
  it("reports progress and the first unfinished exercise", () => {
    const first = exercise(1, "Monday", { exerciseSets: [set(), set()] });
    const second = exercise(2, "Monday", { exerciseSets: [set()] });
    const done = new Set(first.exerciseSets.map((item) => item.id));

    expect(getWorkoutDayStatus([first, second], done)).toEqual({
      totalSets: 3,
      doneSets: 2,
      percent: 67,
      firstUnfinishedId: 2,
    });
    expect(getWorkoutDayStatus([], new Set()).percent).toBe(0);
  });
});
