import { useLiveQuery } from "dexie-react-hooks";
import { BarChart3, CheckCircle2, Circle, Dumbbell, Timer } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { Link } from "react-router";
import { listExercisesForDay } from "../../../app/db/repositories/exercise.repository";
import { listCompletedSetIdsForExerciseDay } from "../../../app/db/repositories/workout-log.repository";
import type { ExerciseTemplate } from "../../../app/db/models/exercise.model";
import {
  Badge,
  EmptyState,
  PageShell,
  Panel,
  ProgressBar,
  RowCard,
  cn,
} from "../../../shared/ui";
import getTodayWorkoutDay from "../../../shared/lib/getTodayWorkoutDay";

interface IExerciseCompletion {
  exercise: ExerciseTemplate;
  completedSetIds: Set<string>;
}

export default function TodayAnalyticsScreen() {
  const today = useMemo(() => getTodayWorkoutDay(), []);
  const exercises = useLiveQuery(() => listExercisesForDay(today), [today], []);
  const exerciseCompletion = useLiveQuery(
    async () => {
      const rows = await Promise.all(
        exercises
          .filter((exercise) => exercise.id != null)
          .map(async (exercise) => ({
            exercise,
            completedSetIds: new Set(
              await listCompletedSetIdsForExerciseDay(exercise.id!),
            ),
          })),
      );

      return rows;
    },
    [exercises],
    [],
  );

  const plannedSetCount = exercises.reduce(
    (total, exercise) => total + exercise.exerciseSets.length,
    0,
  );
  const completedSetCount = exerciseCompletion.reduce(
    (total, item) => total + item.completedSetIds.size,
    0,
  );
  const completionPercent =
    plannedSetCount === 0 ? 0 : (completedSetCount / plannedSetCount) * 100;

  return (
    <PageShell
      eyebrow="Analytics"
      title="Today"
      description={today + " workout progress across every planned exercise."}
      actions={
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-(--surface-border) bg-white/4 px-4 text-sm font-medium text-(--text-soft) transition hover:-translate-y-0.5 hover:border-(--surface-border-strong) hover:bg-white/8"
          to={"/days/" + today}
        >
          Open workout
        </Link>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Dumbbell size={18} />}
          label="Exercises"
          value={exercises.length}
        />
        <StatCard
          icon={<BarChart3 size={18} />}
          label="Planned Sets"
          value={plannedSetCount}
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Completed"
          value={completedSetCount}
        />
      </div>

      <Panel className="p-4 sm:p-5">
        <ProgressBar value={completionPercent} label="Today's completion" />
      </Panel>

      {exercises.length === 0 ? (
        <EmptyState
          title="No exercises planned today"
          description="Add exercises to today's workout and the analytics view will summarize the whole session here."
        />
      ) : (
        <div className="motion-list space-y-3">
          {exerciseCompletion.map(({ exercise, completedSetIds }) => (
            <ExerciseAnalyticsCard
              key={exercise.id}
              exercise={exercise}
              completedSetIds={completedSetIds}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
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
      <h2 className="mt-3 text-3xl font-semibold text-(--text-strong)">
        {value}
      </h2>
    </Panel>
  );
}

function ExerciseAnalyticsCard({
  exercise,
  completedSetIds,
}: IExerciseCompletion) {
  const completedSetCount = completedSetIds.size;
  const plannedSetCount = exercise.exerciseSets.length;
  const completionPercent =
    plannedSetCount === 0 ? 0 : (completedSetCount / plannedSetCount) * 100;
  const isRepsExercise = exercise.exerciseType === "reps";

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="flex min-w-0 gap-3">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-black/10",
              isRepsExercise
                ? "border-sky-400/25 text-sky-100"
                : "border-amber-400/25 text-amber-100",
            )}
          >
            {isRepsExercise ? <Dumbbell size={20} /> : <Timer size={20} />}
          </div>

          <div className="min-w-0 space-y-2">
            <h2 className="truncate text-base font-semibold">
              {exercise.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-(--text-muted)">
              <Badge tone="soft">{exercise.exerciseType}</Badge>
              <span>{exercise.exerciseUnit}</span>
              <span>
                {completedSetCount}/{plannedSetCount} sets complete
              </span>
            </div>
          </div>
        </div>

        <Link
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-(--surface-border) bg-white/4 px-3 text-sm font-medium text-(--text-soft) transition hover:border-(--surface-border-strong) hover:bg-white/8"
          to={`/exercises/${exercise.id}/history`}
        >
          History
        </Link>
      </div>

      <div className="border-t border-(--surface-border) px-4 pb-4 pt-3 sm:px-5">
        <ProgressBar value={completionPercent} label="Exercise completion" />

        <div className="mt-3 space-y-2">
          {exercise.exerciseSets.map((set, index) => {
            const completed = completedSetIds.has(set.id);

            return (
              <RowCard
                key={set.id}
                className={cn(
                  "flex items-center justify-between gap-3 p-3 text-sm",
                  completed &&
                    "border-emerald-400/30 bg-emerald-500/8 text-emerald-50",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {completed ? (
                    <CheckCircle2
                      className="shrink-0 text-emerald-300"
                      size={18}
                    />
                  ) : (
                    <Circle className="shrink-0 text-(--text-muted)" size={18} />
                  )}
                  <span className="font-medium">Set {index + 1}</span>
                </div>

                <span className="shrink-0 text-xs text-(--text-muted)">
                  {formatSetValue(exercise, set)}
                </span>
              </RowCard>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

function formatSetValue(
  exercise: ExerciseTemplate,
  set: ExerciseTemplate["exerciseSets"][number],
) {
  if (exercise.exerciseType === "time") {
    return `${set.time ?? 0} ${exercise.exerciseUnit}`;
  }

  return `${set.weight ?? 0} ${exercise.exerciseUnit} x ${set.reps ?? 0}`;
}
