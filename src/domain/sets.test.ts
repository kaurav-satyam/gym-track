import { describe, expect, it } from "vitest";
import { fieldsFor, formatNumber, formatSetValues, getStep } from "./sets";

describe("sets", () => {
  it("formats reps and timed sets", () => {
    expect(formatSetValues({ weight: 62.5, reps: 8 }, "reps", "kg")).toBe("62.5 kg × 8");
    expect(formatSetValues({ time: 90 }, "time", "sec")).toBe("90 sec");
    expect(formatSetValues({}, "reps", "lb")).toBe("– lb × –");
  });

  it("rounds away floating point noise", () => {
    expect(formatNumber(0.1 + 0.2)).toBe("0.3");
    expect(formatNumber(undefined)).toBe("–");
  });

  it("uses unit-appropriate stepper increments", () => {
    expect(getStep("weight", "kg")).toBe(2.5);
    expect(getStep("weight", "lb")).toBe(5);
    expect(getStep("reps", "kg")).toBe(1);
    expect(getStep("time", "sec")).toBe(5);
  });

  it("knows which fields each type edits", () => {
    expect(fieldsFor("reps")).toEqual(["weight", "reps"]);
    expect(fieldsFor("time")).toEqual(["time"]);
  });
});
