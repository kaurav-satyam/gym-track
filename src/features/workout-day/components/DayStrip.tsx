import { NavLink } from "react-router";
import type { WorkoutDay } from "@/domain/models/exercise";
import type { DayProgress } from "@/domain/week-progress";
import { WEEKDAYS } from "@/domain/weekdays";
import { cn } from "@/shared/ui";
import { useWeekProgress } from "../hooks/useWeekProgress";

/**
 * S M T W T F S switcher that doubles as the week overview: the dot under each
 * day shows this week's progress (none = rest day, hollow = planned, filled =
 * started, green = all sets done). Today's letter is accented.
 */
export default function DayStrip({ today }: { today: WorkoutDay }) {
  const progressByDay = useWeekProgress();

  return (
    <nav aria-label="Workout days" className="grid grid-cols-7 gap-1">
      {WEEKDAYS.map((day) => {
        const summary = progressByDay.get(day);

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

function ProgressDot({ summary }: { summary?: DayProgress }) {
  if (!summary || summary.totalSets === 0) {
    return <span className="h-1.5 w-1.5" />;
  }

  const done = summary.completedSets === summary.totalSets;

  return (
    <span
      className={cn(
        "h-1.5 w-1.5 rounded-full",
        done
          ? "bg-(--success)"
          : summary.completedSets > 0
            ? "bg-current"
            : "border border-current opacity-60",
      )}
    />
  );
}

function describeDay(day: WorkoutDay, today: WorkoutDay, summary?: DayProgress) {
  const progress =
    summary && summary.totalSets > 0
      ? `${summary.completedSets} of ${summary.totalSets} sets done this week`
      : "rest day";

  return `${day}${day === today ? " (today)" : ""}, ${progress}`;
}
