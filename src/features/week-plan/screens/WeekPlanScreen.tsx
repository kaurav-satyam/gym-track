import { PageShell } from "../../../shared/ui";
import WeekdaySummaryList from "../components/WeekdaySummaryList";

export default function WeekPlanScreen() {
  return (
    <PageShell
      eyebrow="Gym Track"
      title="Weekly split"
      description="Choose a day to manage its exercises, update your planned sets, and keep your workout log in sync."
    >
      <WeekdaySummaryList />
    </PageShell>
  );
}
