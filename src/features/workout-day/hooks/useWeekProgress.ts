import { useLiveQuery } from "dexie-react-hooks";
import { getWeekProgress } from "@/data/repositories/progress.repository";
import type { DayProgress } from "@/domain/week-progress";
import type { WorkoutDay } from "@/domain/models/exercise";

/** This week's progress keyed by weekday; empty until loaded. */
export function useWeekProgress(): ReadonlyMap<WorkoutDay, DayProgress> {
  const days = useLiveQuery(() => getWeekProgress(), []);

  return new Map(days?.map((day) => [day.day, day]));
}
