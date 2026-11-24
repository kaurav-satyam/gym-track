import type { WorkoutDay } from "@/domain/models/exercise";

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function isWeekday(value: string | undefined): value is WorkoutDay {
  return (WEEKDAYS as readonly string[]).includes(value ?? "");
}

export function getTodayWorkoutDay(): WorkoutDay {
  return WEEKDAYS[new Date().getDay()];
}
