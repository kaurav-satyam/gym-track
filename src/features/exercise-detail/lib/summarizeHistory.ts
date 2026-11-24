import type { ExerciseType } from "../../../app/db/models/exercise.model";
import type { WorkoutSetLog } from "../../../app/db/models/workout-log.model";

export interface ExerciseSession {
  key: string;
  date: Date;
  /** Oldest first, i.e. in the order the sets were done. */
  logs: WorkoutSetLog[];
}

export interface ExerciseHistorySummary {
  sessions: ExerciseSession[];
  best?: WorkoutSetLog;
}

/** Groups logs into one session per calendar day (newest first) and finds the best set. */
export function summarizeHistory(
  logs: WorkoutSetLog[],
  exerciseType: ExerciseType,
): ExerciseHistorySummary {
  const sessionsByKey = new Map<string, ExerciseSession>();
  let best: WorkoutSetLog | undefined;

  for (const log of logs) {
    const key = log.completedAt.toDateString();
    const session = sessionsByKey.get(key);

    if (session) {
      session.logs.push(log);
    } else {
      sessionsByKey.set(key, { key, date: log.completedAt, logs: [log] });
    }

    if (!best || isBetter(log, best, exerciseType)) {
      best = log;
    }
  }

  const sessions = [...sessionsByKey.values()]
    .map((session) => ({
      ...session,
      logs: [...session.logs].sort(
        (left, right) => left.completedAt.getTime() - right.completedAt.getTime(),
      ),
    }))
    .sort((left, right) => right.date.getTime() - left.date.getTime());

  return { sessions, best };
}

function isBetter(
  candidate: WorkoutSetLog,
  current: WorkoutSetLog,
  exerciseType: ExerciseType,
) {
  if (exerciseType === "time") {
    return (candidate.time ?? 0) > (current.time ?? 0);
  }

  const weightDiff = (candidate.weight ?? 0) - (current.weight ?? 0);

  return weightDiff > 0 || (weightDiff === 0 && (candidate.reps ?? 0) > (current.reps ?? 0));
}

export function formatSessionDate(date: Date) {
  const sameYear = date.getFullYear() === new Date().getFullYear();

  return date.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  });
}
