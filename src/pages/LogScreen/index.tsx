import { useLiveQuery } from "dexie-react-hooks";
import { Calendar, Dumbbell } from "lucide-react";
import { useParams } from "react-router";
import { getExercise } from "../../app/db/repositories/exercise.repository";
import { listWorkoutLogsByExercise } from "../../app/db/repositories/workout-log.repository";
import type {
  TExerciseType,
  TExerciseUnitType,
} from "../../app/db/table/exercise.table";
import type { IWorkoutSetLog } from "../../app/db/table/workout-log.table";
import {
  Badge,
  EmptyState,
  PageShell,
  Panel,
  RowCard,
} from "../../components/ui";

export default function LogScreen() {
  const { excid } = useParams<{ excid: string }>();
  const exerciseId = Number(excid);
  const hasValidExerciseId = Number.isFinite(exerciseId);

  const exercise = useLiveQuery(
    () => (hasValidExerciseId ? getExercise(exerciseId) : undefined),
    [exerciseId],
  );

  const logs = useLiveQuery(
    () => (hasValidExerciseId ? listWorkoutLogsByExercise(exerciseId) : []),
    [exerciseId],
    [],
  );

  if (!hasValidExerciseId) {
    return (
      <PageShell title="Exercise history">
        <EmptyState
          title="Invalid exercise"
          description="Open an exercise from one of the weekday screens to see its full history."
        />
      </PageShell>
    );
  }

  if (!exercise) {
    return (
      <PageShell title="Exercise history">
        <EmptyState
          title="Loading exercise"
          description="Fetching the saved workout logs."
        />
      </PageShell>
    );
  }

  const groupedLogs = logs.reduce<TGroupedLogs>((acc, log) => {
    const date = log.completedAt.toDateString();

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(log);

    return acc;
  }, {});

  return (
    <PageShell
      eyebrow="Exercise history"
      title={exercise.title}
      description="Every completed set is stored as a dated log so you can review how the exercise has been performed over time."
    >
      <Panel className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-(--surface-border) bg-white/4 text-(--text-soft)">
            <Dumbbell size={20} />
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-(--text-soft)">
                Saved exercise details
              </p>
              <p className="mt-1 text-sm leading-6 text-(--text-muted)">
                Review the planned unit and compare it against the completed log
                entries below.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge tone="soft">{exercise.exerciseType}</Badge>
              <Badge tone="soft">{exercise.exerciseUnit}</Badge>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Completed Sets" value={logs.length} />
        <StatCard label="Planned Sets" value={exercise.exerciseSets.length} />
      </div>

      {logs.length === 0 ? (
        <EmptyState
          title="No workout logs yet"
          description="Mark sets as complete from the day screen and each finished set will appear here."
        />
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedLogs).map(([date, entries]) => (
            <section key={date} className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-(--text-muted)">
                <Calendar size={16} />
                <h2>{date}</h2>
              </div>

              <div className="space-y-2">
                {entries.map((log) => (
                  <LogRow
                    key={log.id}
                    log={log}
                    exerciseType={exercise.exerciseType}
                    exerciseUnit={exercise.exerciseUnit}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageShell>
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

interface ILogRowProps {
  log: IWorkoutSetLog;
  exerciseType: TExerciseType;
  exerciseUnit: TExerciseUnitType;
}

function LogRow({ log, exerciseType, exerciseUnit }: ILogRowProps) {
  return (
    <RowCard className="flex items-center justify-between gap-3 px-4 py-3">
      {exerciseType === "reps" ? (
        <div>
          <p className="text-base font-semibold text-(--text-strong)">
            {log.weight ?? "--"}
            {exerciseUnit}
          </p>
          <p className="text-sm text-(--text-muted)">{log.reps ?? "--"} reps</p>
        </div>
      ) : (
        <div>
          <p className="text-base font-semibold text-(--text-strong)">
            {log.time ?? "--"}
            {exerciseUnit}
          </p>
          <p className="text-sm text-(--text-muted)">Timed effort</p>
        </div>
      )}

      <span className="text-xs font-medium uppercase tracking-[0.16em] text-(--text-muted)">
        {log.completedAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </RowCard>
  );
}

type TGroupedLogs = Record<string, IWorkoutSetLog[]>;
