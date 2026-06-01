import WeekdayList from "../../components/WeekdayList";
import { PageShell } from "../../components/ui";

export default function Home() {
  return (
    <PageShell
      eyebrow="Gym Track"
      title="Weekly split"
      description="Choose a day to manage its exercises, update your planned sets, and keep your workout log in sync."
    >
      <WeekdayList />
    </PageShell>
  );
}
