import { describe, expect, it } from "vitest";
import { at, exercise, log, set } from "@/test/fixtures";
import { summarizeHistory } from "./history";

describe("summarizeHistory", () => {
  const bench = exercise(1, "Monday", { exerciseSets: [set({ weight: 60, reps: 10 }), set({ weight: 60, reps: 8 })] });

  it("groups logs into daily sessions, newest first, sets in order", () => {
    const logs = [
      log(bench, 1, at(2026, 11, 23, 18, 5)),
      log(bench, 0, at(2026, 11, 16, 18, 0)),
      log(bench, 0, at(2026, 11, 23, 18, 0)),
    ];
    const { sessions } = summarizeHistory(logs, "reps");

    expect(sessions).toHaveLength(2);
    expect(sessions[0].date.getDate()).toBe(23);
    expect(sessions[0].logs.map((entry) => entry.completedAt.getMinutes())).toEqual([0, 5]);
  });

  it("picks the heaviest set, breaking ties on reps", () => {
    const logs = [
      log(bench, 0, at(2026, 11, 16), { weight: 60, reps: 8 }),
      log(bench, 0, at(2026, 11, 23), { weight: 60, reps: 10 }),
      log(bench, 1, at(2026, 11, 23), { weight: 57.5, reps: 12 }),
    ];

    expect(summarizeHistory(logs, "reps").best).toMatchObject({ weight: 60, reps: 10 });
  });

  it("picks the longest set for timed exercises", () => {
    const plank = exercise(2, "Monday", { exerciseType: "time", exerciseUnit: "sec", exerciseSets: [set({ time: 60 })] });
    const logs = [log(plank, 0, at(2026, 11, 16), { time: 75 }), log(plank, 0, at(2026, 11, 23), { time: 60 })];

    expect(summarizeHistory(logs, "time").best?.time).toBe(75);
  });

  it("handles no history", () => {
    expect(summarizeHistory([], "reps")).toEqual({ sessions: [], best: undefined });
  });
});
