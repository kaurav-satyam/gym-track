import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router";
import { listWeekdaySummaries } from "../../app/db/repositories/weekday.repository";
import { WEEKDAYS } from "../../data/weekday.data";
import WeekdayCard from "./WeekdayCard";

export default function WeekdayList() {
  const navigate = useNavigate();
  const weekdaySummaries = useLiveQuery(() => listWeekdaySummaries(), [], []);

  const summaryByDay = new Map(
    weekdaySummaries.map((summary) => [summary.day, summary]),
  );

  return (
    <div className="space-y-3">
      {WEEKDAYS.map((day) => {
        const summary = summaryByDay.get(day);
        const totalSetsCount = summary?.totalSetsCount ?? 0;
        const completedSetsCount = summary?.completedSetsCount ?? 0;
        const progressLabel =
          totalSetsCount > 0
            ? `${completedSetsCount}/${totalSetsCount} sets complete`
            : "No sets planned";

        return (
          <WeekdayCard
            key={day}
            day={day}
            exerciseCount={summary?.exerciseCount ?? 0}
            duration={summary?.plannedDurationMin}
            progress={summary?.progress ?? 0}
            progressLabel={progressLabel}
            onClick={() => navigate(`/dayscreen/${day}`)}
          />
        );
      })}
    </div>
  );
}
