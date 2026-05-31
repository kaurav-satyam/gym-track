import { Calendar, Dumbbell } from "lucide-react";

import { useParams } from "react-router";

import { useLiveQuery } from "dexie-react-hooks";

import { db } from "../../app/db";

export default function LogScreen() {
  const { excid } = useParams<{ excid: string }>();

  const exerciseId = Number(excid);

  const exercise = useLiveQuery(() => db.exercises.get(exerciseId));

  const logs = useLiveQuery(() =>
    db.workoutlogs
      .where("exerciseId")
      .equals(exerciseId)
      .reverse()
      .sortBy("completedAt"),
  );

  if (!exercise) {
    return <div className="p-4">Loading...</div>;
  }

  const groupedLogs =
    logs?.reduce(
      (acc, log) => {
        const date = log.completedAt.toDateString();

        if (!acc[date]) {
          acc[date] = [];
        }

        acc[date].push(log);

        return acc;
      },
      {} as Record<string, typeof logs>,
    ) ?? {};

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div
        className="
          rounded-2xl
          border
          border-zinc-800
          bg-zinc-950
          p-5
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-zinc-900
            "
          >
            <Dumbbell size={20} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">{exercise.title}</h1>

            <p className="text-sm text-zinc-400">
              {exercise.exerciseType}
              {" • "}
              {exercise.exerciseUnit}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard label="Total Sets" value={logs?.length ?? 0} />

        <StatCard label="Planned Sets" value={exercise.exerciseSets.length} />
      </div>

      {/* Logs */}

      <div className="mt-6 space-y-5">
        {Object.entries(groupedLogs).map(([date, entries]) => (
          <section key={date}>
            <div
              className="
                  mb-2
                  flex
                  items-center
                  gap-2
                  text-zinc-400
                "
            >
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
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="
        rounded-xl
        border
        border-zinc-800
        bg-zinc-950
        p-4
      "
    >
      <p className="text-xs text-zinc-500">{label}</p>

      <h2 className="mt-1 text-2xl font-bold text-white">{value}</h2>
    </div>
  );
}

function LogRow({ log, exerciseType, exerciseUnit }: any) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        rounded-xl
        border
        border-zinc-800
        bg-zinc-950
        px-4
        py-3
      "
    >
      {exerciseType === "reps" ? (
        <div>
          <span className="font-semibold text-white">
            {log.weight}
            {exerciseUnit}
          </span>

          <span className="ml-2 text-zinc-400">× {log.reps}</span>
        </div>
      ) : (
        <div>
          <span className="font-semibold text-white">
            {log.time}
            {exerciseUnit}
          </span>
        </div>
      )}

      <span className="text-xs text-zinc-500">
        {new Date(log.completedAt).toLocaleTimeString()}
      </span>
    </div>
  );
}
