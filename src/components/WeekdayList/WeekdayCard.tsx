import type { TDay } from "../../app/db/table/exercise.table";
import { ArrowUpRight } from "lucide-react";
import { Badge, Panel, ProgressBar } from "../ui";

interface IWeekdayCardProps {
  readonly day: TDay;
  readonly workoutType?: string;
  readonly exerciseCount?: number;
  readonly duration?: number;
  readonly muscleGroups?: string[];
  readonly progress?: number;
  readonly progressLabel?: string;
  readonly isRestDay?: boolean;
  readonly onClick?: () => void;
}

export default function WeekdayCard({
  day,
  workoutType,
  exerciseCount = 0,
  duration,
  muscleGroups = [],
  progress = 0,
  progressLabel,
  onClick,
}: IWeekdayCardProps) {
  const durationLabel = duration ? `${duration}m` : "--";
  const muscleGroupLabel =
    muscleGroups.length > 0
      ? muscleGroups.join(" • ")
      : exerciseCount > 0
        ? "Open the day to manage exercises and sets."
        : "Tap in to build this day.";

  return (
    <Panel
      as="button"
      type="button"
      interactive
      onClick={onClick}
      className="w-full space-y-5 p-5 text-left"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-(--text-muted)">
            Day plan
          </p>

          <div>
            <h2 className="text-xl font-semibold text-(--text-strong)">
              {day}
            </h2>
            <p className="mt-1 text-sm text-(--text-muted)">
              {muscleGroupLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {workoutType && <Badge>{workoutType}</Badge>}

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-(--surface-border) bg-white/3 text-(--text-soft)">
            <ArrowUpRight size={16} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="Exercises" value={String(exerciseCount)} />
        <Metric label="Duration" value={durationLabel} />
      </div>

      <ProgressBar value={progress} label={progressLabel} />
    </Panel>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-(--surface-border) bg-black/10 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-(--text-muted)">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-(--text-strong)">
        {value}
      </p>
    </div>
  );
}
