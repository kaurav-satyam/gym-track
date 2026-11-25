import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { toDateKey } from "@/domain/dates";
import type { ExerciseStat, ProgressDay } from "@/domain/progress";
import { MuscleThumbnail, hasMuscleTargets } from "@/shared/muscle-map";
import {
  Card,
  ProgressRing,
  ScreenHeader,
  SectionTitle,
  cn,
} from "@/shared/ui";
import { useProgress } from "../hooks/useProgress";

export default function ProgressScreen() {
  const { summary, isCurrent, showPrevious, showNext, showCurrent } = useProgress();
  const completion =
    summary && summary.plannedSets > 0
      ? Math.round((summary.completedSets / summary.plannedSets) * 100)
      : 0;

  return (
    <section className="motion-page mx-auto w-full max-w-xl space-y-6 px-4 pb-10 pt-4">
      <header className="space-y-5">
        <ScreenHeader eyebrow={isCurrent ? "This week" : "Past week"} title="Progress" />

        <div className="flex items-center justify-between rounded-full bg-(--surface-control) p-1">
            <RangeButton label="Previous week" onClick={showPrevious}>
              <ChevronLeft size={18} />
            </RangeButton>
            <button
              type="button"
              className="min-h-9 flex-1 whitespace-nowrap px-2 text-center text-sm font-semibold tabular-nums text-(--text-strong) disabled:cursor-default"
              title={isCurrent ? undefined : "Back to this week"}
              disabled={isCurrent}
              onClick={showCurrent}
            >
              {summary?.range.label ?? ""}
            </button>
            <RangeButton label="Next week" disabled={isCurrent} onClick={showNext}>
              <ChevronRight size={18} />
            </RangeButton>
        </div>
      </header>

      {summary && (
        <>
          <Card className="space-y-5 p-5">
            <div className="flex items-center gap-4">
              <ProgressRing value={completion} size={72} strokeWidth={7}>
                <span className="text-base font-bold tabular-nums text-(--text-strong)">
                  {completion}%
                </span>
              </ProgressRing>
              <div className="min-w-0">
                <p className="text-2xl font-bold tabular-nums tracking-tight text-(--text-strong)">
                  {summary.completedSets}
                  <span className="text-(--text-muted)"> / {summary.plannedSets}</span>
                </p>
                <p className="text-sm text-(--text-muted)">planned sets completed</p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3">
              <Stat label="Exercises done">
                {summary.exerciseStats.filter((stat) => stat.completedSets > 0).length}
              </Stat>
              <Stat label="Active days">{summary.activeDays}</Stat>
            </dl>

            <SetsChart days={summary.days} />
          </Card>

          {summary.completedSets === 0 ? (
            <Card className="flex flex-col items-center px-6 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--accent-soft) text-(--accent)">
                <BarChart3 size={26} />
              </span>
              <p className="mt-4 font-semibold text-(--text-strong)">No sets logged yet</p>
              <p className="mt-1 text-sm text-(--text-muted)">
                {isCurrent
                  ? "Finish a set and your week fills in here."
                  : "Nothing was logged that week."}
              </p>
            </Card>
          ) : (
            <>
              <section>
                <SectionTitle>Muscles trained</SectionTitle>
                <Card className="space-y-3 p-4">
                  {summary.muscleStats.slice(0, 8).map((stat) => (
                    <div key={stat.tag} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-3">
                      <span className="truncate text-sm font-medium text-(--text-soft)">{stat.tag}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-(--surface-control)">
                        <span
                          className="block h-full rounded-full bg-(--accent) transition-[width] duration-700"
                          style={{
                            width: `${(stat.completedSets / summary.muscleStats[0].completedSets) * 100}%`,
                          }}
                        />
                      </span>
                      <span className="text-right text-sm font-semibold tabular-nums text-(--text-strong)">
                        {stat.completedSets}
                      </span>
                    </div>
                  ))}
                </Card>
              </section>

              <section>
                <SectionTitle>Exercises</SectionTitle>
                <Card className="overflow-hidden">
                  <ul className="divide-y divide-(--surface-card-border)">
                    {summary.exerciseStats
                      .filter((stat) => stat.completedSets > 0)
                      .map((stat) => (
                        <ExerciseStatRow key={stat.exerciseId} stat={stat} />
                      ))}
                  </ul>
                </Card>
              </section>
            </>
          )}
        </>
      )}
    </section>
  );
}

function SetsChart({ days }: { days: ProgressDay[] }) {
  const max = Math.max(1, ...days.map((point) => Math.max(point.plannedSets, point.completedSets)));
  const todayKey = toDateKey(new Date());
  const gap = "gap-2.5";

  return (
    <figure aria-label="Sets per day: completed over planned" className="space-y-2">
      <div className={cn("flex h-32 items-end", gap)}>
        {days.map((point) => (
          <div
            key={point.key}
            title={`${point.label}: ${point.completedSets}/${point.plannedSets} sets`}
            className="relative h-full flex-1"
          >
            <span
              className="absolute inset-x-0 bottom-0 rounded-lg bg-(--surface-control)"
              style={{ height: `${(point.plannedSets / max) * 100}%` }}
            />
            <span
              className="absolute inset-x-0 bottom-0 rounded-lg bg-(--accent) transition-[height] duration-700"
              style={{ height: `${(point.completedSets / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className={cn("flex text-[11px] font-medium text-(--text-muted)", gap)}>
        {days.map((point) => (
          <span
            key={point.key}
            className={cn(
              "flex-1 text-center",
              point.key === todayKey && "font-bold text-(--accent)",
            )}
          >
            {point.label}
          </span>
        ))}
      </div>
      <figcaption className="flex gap-4 pt-1 text-xs text-(--text-muted)">
        <Legend className="bg-(--accent)">Done</Legend>
        <Legend className="bg-(--surface-control-hover)">Planned</Legend>
      </figcaption>
    </figure>
  );
}

function ExerciseStatRow({ stat }: { stat: ExerciseStat }) {
  const sets = `${stat.completedSets} ${stat.completedSets === 1 ? "set" : "sets"}`;
  const best =
    stat.bestSetValue > 0 ? `Best ${formatCompact(stat.bestSetValue)} ${stat.exerciseUnit}` : "";

  return (
    <li>
      <Link
        to={`/exercises/${stat.exerciseId}`}
        className="flex items-center gap-3 px-4 py-3 transition-colors active:bg-(--surface-control) hover:bg-(--surface-control)"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--surface-inset) p-1.5">
          {hasMuscleTargets(stat.muscleTags) && (
            <MuscleThumbnail tags={stat.muscleTags} className="h-full w-auto max-w-full" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-(--text-strong)">{stat.title}</span>
          <span className="block text-sm tabular-nums text-(--text-muted)">
            {[sets, best].filter(Boolean).join(" · ")}
          </span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-(--text-muted)" />
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
      className="flex h-8 w-8 items-center justify-center rounded-full text-(--text-soft) transition active:scale-90 hover:bg-(--surface-control-hover) disabled:opacity-30"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Stat({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-(--surface-inset) px-4 py-3">
      <dt className="text-xs font-medium text-(--text-muted)">
        {label}
        {hint && <span className="opacity-70"> · {hint}</span>}
      </dt>
      <dd className="mt-1 text-xl font-bold tabular-nums tracking-tight text-(--text-strong)">
        {children}
      </dd>
    </div>
  );
}

function Legend({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      {children}
    </span>
  );
}

function formatCompact(value: number) {
  return Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(
    Math.round(value * 10) / 10,
  );
}
