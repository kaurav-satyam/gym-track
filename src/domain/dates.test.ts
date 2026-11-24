import { describe, expect, it } from "vitest";
import { at } from "@/test/fixtures";
import { eachDay, getDayBounds, startOfWeek, toDateKey } from "./dates";

describe("dates", () => {
  it("getDayBounds spans the whole local day", () => {
    const { start, end } = getDayBounds(at(2026, 11, 24, 15, 30));

    expect(start).toEqual(at(2026, 11, 24, 0, 0));
    expect(end.getTime()).toBe(at(2026, 11, 25, 0, 0).getTime() - 1);
  });

  it("startOfWeek returns the previous Sunday at midnight", () => {
    // 24 Nov 2026 is a Tuesday.
    expect(startOfWeek(at(2026, 11, 24, 18))).toEqual(at(2026, 11, 22, 0));
    // A Sunday is its own week start.
    expect(startOfWeek(at(2026, 11, 22, 9))).toEqual(at(2026, 11, 22, 0));
  });

  it("eachDay is inclusive on both ends and crosses months", () => {
    const days = eachDay(at(2026, 11, 29), at(2026, 12, 2));

    expect(days.map(toDateKey)).toEqual(["2026-11-29", "2026-11-30", "2026-12-01", "2026-12-02"]);
  });
});
