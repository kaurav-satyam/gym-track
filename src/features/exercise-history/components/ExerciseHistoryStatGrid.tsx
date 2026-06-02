import { Panel } from "../../../shared/ui";

interface IExerciseHistoryStatGridProps {
  completedSetCount: number;
  plannedSetCount: number;
}

export default function ExerciseHistoryStatGrid({
  completedSetCount,
  plannedSetCount,
}: IExerciseHistoryStatGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <StatCard label="Completed Sets" value={completedSetCount} />
      <StatCard label="Planned Sets" value={plannedSetCount} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Panel className="p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--text-muted)">
        {label}
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-(--text-strong)">
        {value}
      </h2>
    </Panel>
  );
}
