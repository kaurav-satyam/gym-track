import { useLiveQuery } from "dexie-react-hooks";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  getAnalyticsRange,
  getAnalyticsSummary,
  shiftAnalyticsDate,
  type AnalyticsExerciseStat,
  type AnalyticsPeriod,
  type AnalyticsTrendPoint,
} from "../../../app/db/repositories/analytics.repository";
import { MuscleThumbnail, hasMuscleTargets } from "../../../shared/muscle-map";
import { SegmentedControl, cn } from "../../../shared/ui";

type ProgressPeriod = Extract<AnalyticsPeriod, "week" | "month">;

const PERIOD_OPTIONS: { label: string; value: ProgressPeriod }[] = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

export default function ProgressScreen() {
  const [period, setPeriod] = useState<ProgressPeriod>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const summary = useLiveQuery(
    () => getAnalyticsSummary({ period, anchorDate }),
    [period, anchorDate],
  );
  const isCurrentRange =
    getAnalyticsRange(period, anchorDate).label ===
    getAnalyticsRange(period, new Date()).label;

  return (
    <section className="motion-page mx-auto w-full max-w-xl space-y-7 px-4 pb-10 pt-5">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-(--text-strong)">Progress</h1>
        <div className="flex items-center justify-between gap-3">
          <SegmentedControl options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
          <div className="flex items-center">
            <RangeButton label="Previous" onClick={() => setAnchorDate(shiftAnalyticsDate(anchorDate, period, -1))}>
              <ChevronLeft size={18} />
            </RangeButton>
            <button
              type="button"
              className="min-h-10 min-w-24 whitespace-nowrap px-1 text-center text-sm font-medium tabular-nums text-(--text-strong) disabled:cursor-default"
              title={isCurrentRange ? undefined : "Back to current"}
              disabled={isCurrentRange}
              onClick={() => setAnchorDate(new Date())}
            >
              {summary?.range.label ?? ""}
            </button>
            <RangeButton
              label="Next"
              disabled={isCurrentRange}
              onClick={() => setAnchorDate(shiftAnalyticsDate(anchorDate, period, 1))}
            >
              <ChevronRight size={18} />
            </RangeButton>
          </div>
        </div>
      </header>

      {summary && (
        <>
          <dl className="grid grid-cols-3 gap-3">
            <Stat label="Sets done">
              {summary.completedSets}
              <span className="text-(--text-muted)">/{summary.plannedSets}</span>
            </Stat>
            <Stat label="Volume">{formatCompact(summary.loadVolume)}</Stat>
            <Stat label="Active days">{summary.activeDays}</Stat>
          </dl>

          <SetsChart trend={summary.trend} period={period} />

          {summary.completedSets === 0 ? (
            <p className="text-center text-sm text-(--text-muted)">
              No sets logged {isCurrentRange ? `this ${period} yet` : `in this ${period}`}.
            </p>
          ) : (
            <>
              <Section title="Muscles">
                <ul className="space-y-2.5">
                  {summary.muscleStats.slice(0, 8).map((stat) => (
                    <li key={stat.tag} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-sm">
                      <span className="truncate text-(--text-soft)">{stat.tag}</span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-(--surface-control)">
                        <span
                          className="block h-full rounded-full bg-(--accent)"
                          style={{
                            width: `${(stat.completedSets / summary.muscleStats[0].completedSets) * 100}%`,
                          }}
                        />
                      </span>
                      <span className="text-right tabular-nums text-(--text-muted)">{stat.completedSets}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Exercises">
                <ul>
                  {summary.exerciseStats
                    .filter((stat) => stat.completedSets > 0)
                    .map((stat) => (
                      <ExerciseStatRow key={stat.exerciseId} stat={stat} />
                    ))}
                </ul>
              </Section>
            </>
          )}
        </>
      )}
    </section>
  );
}

function SetsChart({ trend, period }: { trend: AnalyticsTrendPoint[]; period: ProgressPeriod }) {
  const max = Math.max(1, ...trend.map((point) => Math.max(point.plannedSets, point.completedSets)));

  return (
    <figure aria-label="Sets per day: completed over planned" className="space-y-2">
      <div className={cn("flex h-28 items-end", period === "week" ? "gap-3" : "gap-0.5")}>
        {trend.map((point) => (
          <div
            key={point.key}
            title={`${point.label}: ${point.completedSets}/${point.plannedSets} sets`}
            className="relative h-full flex-1"
          >
            <span
              className="absolute inset-x-0 bottom-0 rounded-md bg-(--surface-control)"
              style={{ height: `${(point.plannedSets / max) * 100}%` }}
            />
            <span
              className="absolute inset-x-0 bottom-0 rounded-md bg-(--accent) transition-[height] duration-500"
              style={{ height: `${(point.completedSets / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className={cn("flex text-xs text-(--text-muted)", period === "week" ? "gap-3" : "gap-0.5")}>
        {trend.map((point, index) => (
          <span key={point.key} className="flex-1 text-center">
            {period === "week" || index % 5 === 0 ? point.label : ""}
          </span>
        ))}
      </div>
      <figcaption className="flex gap-4 text-xs text-(--text-muted)">
        <Legend className="bg-(--accent)">Done</Legend>
        <Legend className="bg-(--surface-control)">Planned</Legend>
      </figcaption>
    </figure>
  );
}

function ExerciseStatRow({ stat }: { stat: AnalyticsExerciseStat }) {
  const best =
    stat.bestSetValue > 0 ? ` · best ${formatCompact(stat.bestSetValue)} ${stat.exerciseUnit}` : "";

  return (
    <li>
      <Link
        to={`/exercises/${stat.exerciseId}`}
        className="flex items-center gap-3 rounded-2xl py-2 hover:bg-(--surface-control)"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--surface-inset) p-1">
          {hasMuscleTargets(stat.muscleTags) && (
            <MuscleThumbnail tags={stat.muscleTags} className="h-full w-auto max-w-full" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-(--text-strong)">{stat.title}</span>
          <span className="block text-sm tabular-nums text-(--text-muted)">
            {stat.completedSets} sets{best}
          </span>
        </span>
        <ChevronRight size={16} className="shrink-0 text-(--text-muted)" />
      </Link>
    </li>
  );
}

function RangeButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-(--text-soft) hover:bg-(--surface-control) disabled:opacity-30"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-(--text-muted)">{label}</dt>
      <dd className="mt-0.5 text-2xl font-semibold tabular-nums text-(--text-strong)">{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-(--text-soft)">{title}</h2>
      {children}
    </section>
  );
}

function Legend({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-sm", className)} />
      {children}
    </span>
  );
}

function formatCompact(value: number) {
  return Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(
    Math.round(value * 10) / 10,
  );
}
