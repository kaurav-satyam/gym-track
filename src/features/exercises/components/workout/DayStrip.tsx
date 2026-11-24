import { useLiveQuery } from "dexie-react-hooks";
import { NavLink } from "react-router";
import type { WorkoutDay } from "../../../../app/db/models/exercise.model";
import {
  listWeekPlanSummaries,
  type WeekPlanSummary,
} from "../../../../app/db/repositories/week-plan.repository";
import { WEEKDAYS } from "../../../../shared/constants/weekdays";
import { cn } from "../../../../shared/ui";

/**
 * S M T W T F S switcher that doubles as the week overview: the dot under each
 * day shows this week's progress (none = rest day, hollow = planned, filled =
 * started, green = all sets done). Today's letter is accented.
 */
export default function DayStrip({ today }: { today: WorkoutDay }) {
  const summaries = useLiveQuery(() => listWeekPlanSummaries(), []);
  const summaryByDay = new Map(summaries?.map((summary) => [summary.day, summary]));

  return (
    <nav aria-label="Workout days" className="grid grid-cols-7 gap-1">
      {WEEKDAYS.map((day) => {
        const summary = summaryByDay.get(day);

        return (
          <NavLink
            key={day}
            to={`/days/${day}`}
            replace
            aria-label={describeDay(day, today, summary)}
            className={({ isActive }) =>
              cn(
                "flex h-12 flex-col items-center justify-center gap-1 rounded-2xl text-sm font-semibold transition-colors",
                isActive
                  ? "bg-(--accent) text-(--accent-ink)"
                  : day === today
                    ? "text-(--accent) hover:bg-(--surface-control)"
                    : "text-(--text-soft) hover:bg-(--surface-control)",
              )
            }
          >
            {day.slice(0, 1)}
            <ProgressDot summary={summary} />
          </NavLink>
        );
      })}
    </nav>
  );
}

function ProgressDot({ summary }: { summary?: WeekPlanSummary }) {
  if (!summary || summary.totalSetsCount === 0) {
    return <span className="h-1.5 w-1.5" />;
  }

  const done = summary.completedSetsCount === summary.totalSetsCount;

  return (
    <span
      className={cn(
        "h-1.5 w-1.5 rounded-full",
        done
          ? "bg-(--success)"
          : summary.completedSetsCount > 0
            ? "bg-current"
            : "border border-current opacity-60",
      )}
    />
  );
}

function describeDay(day: WorkoutDay, today: WorkoutDay, summary?: WeekPlanSummary) {
  const progress =
    summary && summary.totalSetsCount > 0
      ? `${summary.completedSetsCount} of ${summary.totalSetsCount} sets done this week`
      : "rest day";

  return `${day}${day === today ? " (today)" : ""}, ${progress}`;
}
