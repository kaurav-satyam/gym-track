import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { useParams } from "react-router";
import { listExercisesByDay } from "../../app/db/repositories/exercise.repository";
import type { TDay } from "../../app/db/table/exercise.table";
import AddExercise from "../../components/AddExercise";
import ExerciseCard from "../../components/ExerciseCard";
import { EmptyState, PageShell } from "../../components/ui";

export default function DayScreen() {
  const { day } = useParams<{
    day: TDay;
  }>();

  const [isOpen, setIsOpen] = useState(false);

  const exercises = useLiveQuery(
    async () => {
      if (!day) {
        return [];
      }

      return listExercisesByDay(day);
    },
    [day],
    [],
  );

  if (!day) {
    return (
      <PageShell title="Day not found">
        <EmptyState
          title="Invalid day"
          description="Pick one of the weekdays from the home screen and try again."
        />
      </PageShell>
    );
  }

  const exerciseCountLabel = `${exercises.length} exercise${exercises.length === 1 ? "" : "s"}`;
  const shouldShowAddExerciseForm = exercises.length === 0 || isOpen;

  return (
    <PageShell
      eyebrow="Workout day"
      title={day}
      description={
        exercises.length > 0
          ? `${exerciseCountLabel} planned for this session.`
          : "Start the session by adding the first exercise for this day."
      }
    >
      <AddExercise
        isOpen={shouldShowAddExerciseForm}
        setIsOpen={setIsOpen}
        day={day}
      />

      {exercises.length === 0 ? (
        <EmptyState
          title="No exercises yet"
          description="Add your first movement above and its sets will show up here."
        />
      ) : (
        <div className="space-y-3">
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
