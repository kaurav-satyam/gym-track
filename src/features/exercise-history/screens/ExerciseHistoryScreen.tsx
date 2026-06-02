import { useLiveQuery } from "dexie-react-hooks";
import { useParams } from "react-router";
import { getExerciseById } from "../../../app/db/repositories/exercise.repository";
import { listExerciseHistory } from "../../../app/db/repositories/workout-log.repository";
import { EmptyState, PageShell } from "../../../shared/ui";
import ExerciseHistoryStatGrid from "../components/ExerciseHistoryStatGrid";
import ExerciseHistorySummary from "../components/ExerciseHistorySummary";
import ExerciseLogGroup from "../components/ExerciseLogGroup";
import groupExerciseHistoryByDate from "../lib/groupExerciseHistoryByDate";

export default function ExerciseHistoryScreen() {
  const { exerciseId: exerciseIdParam } = useParams<{ exerciseId: string }>();
  const exerciseId = Number(exerciseIdParam);
  const hasValidExerciseId = Number.isFinite(exerciseId);

  const exercise = useLiveQuery(
    () => (hasValidExerciseId ? getExerciseById(exerciseId) : undefined),
    [exerciseId],
  );

  const exerciseHistory = useLiveQuery(
    () => (hasValidExerciseId ? listExerciseHistory(exerciseId) : []),
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

  const groupedExerciseHistory = groupExerciseHistoryByDate(exerciseHistory);

  return (
    <PageShell
      eyebrow="Exercise history"
      title={exercise.title}
      description="Every completed set is stored as a dated log so you can review how the exercise has been performed over time."
    >
      <ExerciseHistorySummary
        exerciseType={exercise.exerciseType}
        exerciseUnit={exercise.exerciseUnit}
      />

      <ExerciseHistoryStatGrid
        completedSetCount={exerciseHistory.length}
        plannedSetCount={exercise.exerciseSets.length}
      />

      {exerciseHistory.length === 0 ? (
        <EmptyState
          title="No workout logs yet"
          description="Mark sets as complete from the day screen and each finished set will appear here."
        />
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedExerciseHistory).map(([date, logs]) => (
            <ExerciseLogGroup
              key={date}
              date={date}
              logs={logs}
              exerciseType={exercise.exerciseType}
              exerciseUnit={exercise.exerciseUnit}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
