import { useLiveQuery } from "dexie-react-hooks";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Gauge,
  Timer,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import type {
  AnalyticsExerciseStat,
  AnalyticsMuscleStat,
  AnalyticsPeriod,
  AnalyticsSummary,
  AnalyticsTrendPoint,
  AnalyticsTypeFilter,
} from "../../../app/db/repositories/analytics.repository";
import {
  getAnalyticsSummary,
  shiftAnalyticsDate,
} from "../../../app/db/repositories/analytics.repository";
import { EXERCISE_TYPES } from "../../../app/db/models/exercise.model";
import {
  Badge,
  Button,
  EmptyState,
  IconButton,
  Field,
  PageShell,
  Panel,
  ProgressBar,
  SegmentedControl,
  SelectField,
  cn,
} from "../../../shared/ui";

const ALL_FILTER_VALUE = "all" as const;

const periodOptions: Array<{ label: string; value: AnalyticsPeriod }> = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

const typeFilterOptions: Array<{ label: string; value: AnalyticsTypeFilter }> = [
  { label: "All", value: ALL_FILTER_VALUE },
  ...EXERCISE_TYPES.map((value) => ({ label: value, value })),
];

export default function TodayAnalyticsScreen() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [muscleFilter, setMuscleFilter] = useState<string>(ALL_FILTER_VALUE);
  const [exerciseFilter, setExerciseFilter] = useState<string>(ALL_FILTER_VALUE);
  const [typeFilter, setTypeFilter] =
    useState<AnalyticsTypeFilter>(ALL_FILTER_VALUE);
  const anchorTime = anchorDate.getTime();
  const selectedExerciseId =
    exerciseFilter === ALL_FILTER_VALUE ? undefined : Number(exerciseFilter);
  const summary = useLiveQuery(
    () =>
      getAnalyticsSummary({
        period,
        anchorDate,
        muscleTag: muscleFilter,
        exerciseId: selectedExerciseId,
        exerciseType: typeFilter,
      }),
    [period, anchorTime, muscleFilter, selectedExerciseId, typeFilter],
  );

  function moveRange(direction: -1 | 1) {
    setAnchorDate((currentDate) =>
      shiftAnalyticsDate(currentDate, period, direction),
    );
  }

  return (
    <PageShell
      eyebrow="Analytics"
      title="Training dashboard"
      description="Review completion, volume, muscle balance, and exercise progress across daily, weekly, or monthly ranges."
      actions={
        <Button
          tone="secondary"
          leadingIcon={<CalendarDays size={16} />}
          onClick={() => setAnchorDate(new Date())}
        >
          Today
        </Button>
      }
    >
      <Panel className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <SegmentedControl
            options={periodOptions}
            value={period}
            onChange={setPeriod}
          />

          <div className="flex items-center justify-between gap-2 rounded-2xl border border-(--surface-border) bg-black/10 p-1">
            <IconButton
              aria-label="Previous range"
              tone="secondary"
              onClick={() => moveRange(-1)}
            >
              <ChevronLeft size={16} />
            </IconButton>
            <div className="min-w-0 px-3 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--text-muted)">
                Range
              </p>
              <p className="truncate text-sm font-semibold text-(--text-strong)">
                {summary?.range.label ?? "Loading"}
              </p>
            </div>
            <IconButton
              aria-label="Next range"
              tone="secondary"
              onClick={() => moveRange(1)}
            >
              <ChevronRight size={16} />
            </IconButton>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Muscle group" htmlFor="analytics-muscle-filter">
            <SelectField
              id="analytics-muscle-filter"
              value={muscleFilter}
              onChange={(event) => setMuscleFilter(event.target.value)}
            >
              <option value={ALL_FILTER_VALUE} className="bg-slate-950 text-white">
                All muscles
              </option>
              {(summary?.muscleOptions ?? []).map((tag) => (
                <option key={tag} value={tag} className="bg-slate-950 text-white">
                  {tag}
                </option>
              ))}
            </SelectField>
          </Field>

          <Field label="Exercise" htmlFor="analytics-exercise-filter">
            <SelectField
              id="analytics-exercise-filter"
              value={exerciseFilter}
              onChange={(event) => setExerciseFilter(event.target.value)}
            >
              <option value={ALL_FILTER_VALUE} className="bg-slate-950 text-white">
                All exercises
              </option>
              {(summary?.exerciseOptions ?? []).map((exercise) => (
                <option
                  key={exercise.id}
                  value={String(exercise.id)}
                  className="bg-slate-950 text-white"
                >
                  {exercise.title}
                </option>
              ))}
            </SelectField>
          </Field>

          <Field label="Tracking type">
            <SegmentedControl
              options={typeFilterOptions}
              value={typeFilter}
              onChange={setTypeFilter}
            />
          </Field>
        </div>
      </Panel>

      {!summary ? (
        <EmptyState
          title="Loading analytics"
          description="Preparing your training dashboard from the local workout log."
        />
      ) : (
        <AnalyticsDashboard summary={summary} />
      )}
    </PageShell>
  );
}

function AnalyticsDashboard({ summary }: { summary: AnalyticsSummary }) {
  const hasActivity = summary.completedSets > 0 || summary.plannedSets > 0;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Completed sets"
          value={formatInteger(summary.completedSets)}
          detail={`${formatInteger(summary.plannedSets)} planned`}
        />
        <StatCard
          icon={<Gauge size={18} />}
          label="Completion"
          value={`${Math.round(summary.completionPercent)}%`}
          detail={`${summary.activeDays} active ${summary.activeDays === 1 ? "day" : "days"}`}
        />
        <StatCard
          icon={<Dumbbell size={18} />}
          label="Load volume"
          value={formatInteger(summary.loadVolume)}
          detail="weight x reps"
        />
        <StatCard
          icon={<Timer size={18} />}
          label="Time trained"
          value={formatTime(summary.timeSeconds)}
          detail={`${summary.exerciseCount} matching exercises`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <SetTrendChart trend={summary.trend} />
        <MuscleBalanceChart stats={summary.muscleStats} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1fr)]">
        <CompletionPanel summary={summary} />
        <TopExercisePanel exercises={summary.exerciseStats} />
      </div>

      {!hasActivity ? (
        <EmptyState
          title="No data in this range"
          description="Complete sets in this period or adjust the filters to reveal analytics."
        />
      ) : (
        <ExerciseProgressPanel exercises={summary.exerciseStats} />
      )}
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--text-muted)">
          {label}
        </p>
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-(--surface-border) bg-white/4 text-(--text-soft)">
          {icon}
        </span>
      </div>
      <h2 className="mt-3 truncate text-3xl font-semibold text-(--text-strong)">
        {value}
      </h2>
      <p className="mt-1 text-sm text-(--text-muted)">{detail}</p>
    </Panel>
  );
}

function SetTrendChart({ trend }: { trend: AnalyticsTrendPoint[] }) {
  const maxSets = Math.max(
    1,
    ...trend.flatMap((point) => [point.plannedSets, point.completedSets]),
  );

  return (
    <Panel className="overflow-hidden p-4 sm:p-5">
      <ChartHeader
        icon={<BarChart3 size={18} />}
        title="Set trend"
        description="Planned vs completed sets across the selected range."
      />
      <div className="mt-5 overflow-x-auto pb-1">
        <div
          className="flex h-56 min-w-full items-end gap-3"
          style={{ width: Math.max(420, trend.length * 34) }}
        >
          {trend.map((point) => (
            <div key={point.key} className="flex min-w-6 flex-1 flex-col items-center gap-2">
              <div className="flex h-44 w-full items-end justify-center gap-1.5 rounded-xl border border-(--surface-border) bg-black/10 px-1.5 py-2">
                <Bar
                  value={point.plannedSets}
                  max={maxSets}
                  className="bg-slate-400/35"
                  title={`${point.label}: ${point.plannedSets} planned`}
                />
                <Bar
                  value={point.completedSets}
                  max={maxSets}
                  className="bg-emerald-400"
                  title={`${point.label}: ${point.completedSets} completed`}
                />
              </div>
              <span className="text-[11px] font-medium text-(--text-muted)">
                {point.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-(--text-muted)">
        <LegendDot className="bg-slate-400/45" label="Planned" />
        <LegendDot className="bg-emerald-400" label="Completed" />
      </div>
    </Panel>
  );
}

function Bar({
  value,
  max,
  className,
  title,
}: {
  value: number;
  max: number;
  className: string;
  title: string;
}) {
  const height = value === 0 ? 4 : Math.max(10, (value / max) * 100);

  return (
    <div
      className={cn("w-3 rounded-full transition-all duration-300", className)}
      style={{ height: `${height}%` }}
      title={title}
    />
  );
}

function MuscleBalanceChart({ stats }: { stats: AnalyticsMuscleStat[] }) {
  const visibleStats = stats.slice(0, 8);
  const maxSets = Math.max(1, ...visibleStats.map((stat) => stat.completedSets));
  const totalExposures = stats.reduce((total, stat) => total + stat.completedSets, 0);

  return (
    <Panel className="p-4 sm:p-5">
      <ChartHeader
        icon={<Flame size={18} />}
        title="Muscle balance"
        description="Set exposure by muscle tag. Multi-tag exercises count toward each tag."
      />

      {visibleStats.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-(--surface-border) p-4 text-sm text-(--text-muted)">
          No muscle activity in this range.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {visibleStats.map((stat) => {
            const percent = totalExposures === 0 ? 0 : (stat.completedSets / totalExposures) * 100;

            return (
              <div key={stat.tag} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-(--text-strong)">{stat.tag}</span>
                  <span className="shrink-0 text-xs text-(--text-muted)">
                    {stat.completedSets} sets · {Math.round(percent)}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-black/15 ring-1 ring-(--surface-border)">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.max(6, (stat.completedSets / maxSets) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function CompletionPanel({ summary }: { summary: AnalyticsSummary }) {
  const bestDay = [...summary.trend].sort(
    (left, right) => right.completedSets - left.completedSets,
  )[0];

  return (
    <Panel className="space-y-5 p-4 sm:p-5">
      <ChartHeader
        icon={<Activity size={18} />}
        title="Completion quality"
        description="How much of the planned work was captured."
      />
      <ProgressBar value={summary.completionPercent} label="Range completion" />
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricTile label="Best bucket" value={bestDay?.label ?? "None"} detail={`${bestDay?.completedSets ?? 0} sets`} />
        <MetricTile label="Active days" value={String(summary.activeDays)} detail="days with completed logs" />
      </div>
    </Panel>
  );
}

function TopExercisePanel({ exercises }: { exercises: AnalyticsExerciseStat[] }) {
  const topExercises = exercises.filter((exercise) => exercise.completedSets > 0).slice(0, 5);

  return (
    <Panel className="p-4 sm:p-5">
      <ChartHeader
        icon={<Dumbbell size={18} />}
        title="Top exercises"
        description="Ranked by completed sets in the selected range."
      />

      {topExercises.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-(--surface-border) p-4 text-sm text-(--text-muted)">
          No completed exercises yet.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {topExercises.map((exercise, index) => (
            <Link
              key={exercise.exerciseId}
              to={`/exercises/${exercise.exerciseId}/history`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-(--surface-border) bg-white/4 p-3 transition hover:border-(--surface-border-strong) hover:bg-white/8"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black/15 text-xs font-semibold text-(--text-muted)">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-(--text-strong)">
                    {exercise.title}
                  </p>
                  <p className="text-xs text-(--text-muted)">
                    {formatExerciseOutput(exercise)}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold text-(--text-strong)">
                {exercise.completedSets}
              </span>
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}

function ExerciseProgressPanel({ exercises }: { exercises: AnalyticsExerciseStat[] }) {
  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-(--surface-border) px-4 py-4 sm:px-5">
        <ChartHeader
          icon={<BarChart3 size={18} />}
          title="Exercise progress"
          description="Drill into each exercise for sets, volume, best set, and muscle tags."
        />
      </div>
      <div className="divide-y divide-(--surface-border)">
        {exercises.slice(0, 12).map((exercise) => (
          <Link
            key={exercise.exerciseId}
            to={`/exercises/${exercise.exerciseId}/history`}
            className="grid gap-4 px-4 py-4 transition hover:bg-white/4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5"
          >
            <div className="min-w-0 space-y-2">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="truncate text-base font-semibold text-(--text-strong)">
                  {exercise.title}
                </h2>
                <Badge tone="soft">{exercise.exerciseType}</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {exercise.muscleTags.length === 0 ? (
                  <span className="text-xs text-(--text-muted)">No muscle tags</span>
                ) : (
                  exercise.muscleTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-100"
                    >
                      {tag}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-right sm:min-w-82.5">
              <CompactMetric label="Sets" value={`${exercise.completedSets}/${exercise.plannedSets}`} />
              <CompactMetric label="Output" value={formatExerciseOutput(exercise)} />
              <CompactMetric label="Best" value={formatBestSet(exercise)} />
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function ChartHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-(--surface-border) bg-white/4 text-(--text-soft)">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-(--text-strong)">{title}</h2>
        <p className="mt-1 text-sm text-(--text-muted)">{description}</p>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-(--surface-border) bg-white/4 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-(--text-muted)">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-(--text-strong)">{value}</p>
      <p className="mt-1 text-xs text-(--text-muted)">{detail}</p>
    </div>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-(--surface-border) bg-black/10 p-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-(--text-muted)">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-(--text-strong)">{value}</p>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      {label}
    </span>
  );
}

function formatExerciseOutput(exercise: AnalyticsExerciseStat) {
  if (exercise.exerciseType === "time") {
    return formatTime(exercise.timeSeconds);
  }

  return formatInteger(exercise.loadVolume);
}

function formatBestSet(exercise: AnalyticsExerciseStat) {
  if (exercise.bestSetValue === 0) {
    return "-";
  }

  return `${formatInteger(exercise.bestSetValue)} ${exercise.exerciseUnit}`;
}

function formatInteger(value: number) {
  return Math.round(value).toLocaleString();
}

function formatTime(seconds: number) {
  const roundedSeconds = Math.round(seconds);

  if (roundedSeconds <= 0) {
    return "0m";
  }

  if (roundedSeconds >= 3600) {
    const hours = Math.floor(roundedSeconds / 3600);
    const minutes = Math.round((roundedSeconds % 3600) / 60);

    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  if (roundedSeconds >= 60) {
    return `${Math.round(roundedSeconds / 60)}m`;
  }

  return `${roundedSeconds}s`;
}
