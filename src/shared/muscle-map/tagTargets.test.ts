import { describe, expect, it } from "vitest";
import { getMuscleTargets, hasMuscleTargets } from "./tagTargets";

describe("getMuscleTargets", () => {
  it("maps app tags to body-map regions, case-insensitively", () => {
    expect(getMuscleTargets(["upper chest", "Triceps"])).toEqual({
      chest: ["upperChest"],
      arms: ["triceps"],
    });
  });

  it("expands broad tags and merges duplicates", () => {
    const targets = getMuscleTargets(["Core", "Abs"]);

    expect(targets.core).toEqual(["upperAbs", "lowerAbs", "obliques"]);
    expect(targets.back).toEqual(["lowerBack"]);
  });

  it("ignores non-anatomical tags", () => {
    expect(getMuscleTargets(["Cardio", "Mobility"])).toEqual({});
    expect(hasMuscleTargets(["Cardio"])).toBe(false);
    expect(hasMuscleTargets(["Cardio", "Glutes"])).toBe(true);
  });
});
