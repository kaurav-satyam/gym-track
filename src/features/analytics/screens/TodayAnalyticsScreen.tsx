import { useLiveQuery } from "dexie-react-hooks";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { AnalyticsPeriod, AnalyticsTypeFilter } from "../../../app/db/repositories/analytics.repository";
import { getAnalyticsSummary, shiftAnalyticsDate } from "../../../app/db/repositories/analytics.repository";
import { EXERCISE_TYPES } from "../../../app/db/models/exercise.model";
import { Button, EmptyState, IconButton, Field, PageShell, Panel, SegmentedControl, SelectField } from "../../../shared/ui";

import AnalyticsDashboard from "../components/AnalyticsDashboard";

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

          <div className="flex items-center justify-between gap-2 rounded-2xl border border-(--surface-border) bg-(--surface-inset) p-1">
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

