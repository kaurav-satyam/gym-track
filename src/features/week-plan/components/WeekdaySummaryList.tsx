import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router";
import { listWeekPlanSummaries } from "../../../app/db/repositories/week-plan.repository";
import { WEEKDAYS } from "../../../shared/constants/weekdays";
import getTodayWorkoutDay from "../../../shared/lib/getTodayWorkoutDay";
import WeekdaySummaryCard from "./WeekdaySummaryCard";

export default function WeekdaySummaryList() {
  const navigate = useNavigate();
  const weekPlanSummaries = useLiveQuery(() => listWeekPlanSummaries(), [], []);
  const today = getTodayWorkoutDay();

  const summaryByDay = new Map(
    weekPlanSummaries.map((summary) => [summary.day, summary]),
  );

  return (
    <div className="motion-list space-y-3">
      {WEEKDAYS.map((day) => {
        const summary = summaryByDay.get(day);
        const totalSetsCount = summary?.totalSetsCount ?? 0;
        const completedSetsCount = summary?.completedSetsCount ?? 0;
        const progressLabel =
          totalSetsCount > 0
            ? `${completedSetsCount}/${totalSetsCount} sets complete`
            : "No sets planned";

        return (
          <WeekdaySummaryCard
            key={day}
            day={day}
            exerciseCount={summary?.exerciseCount ?? 0}
            duration={summary?.plannedDurationMin}
            progress={summary?.progress ?? 0}
            progressLabel={progressLabel}
            isToday={day === today}
            onClick={() => navigate("/days/" + day)}
          />
        );
      })}
    </div>
  );
}
