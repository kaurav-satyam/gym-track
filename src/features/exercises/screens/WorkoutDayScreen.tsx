import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { useParams } from "react-router";
import {
  listExercisesForDay,
  moveExerciseTemplate,
} from "../../../app/db/repositories/exercise.repository";
import type { WorkoutDay } from "../../../app/db/models/exercise.model";
import { EmptyState, PageShell } from "../../../shared/ui";
import AddExerciseForm from "../components/AddExerciseForm";
import ExerciseCard from "../components/ExerciseCard";

export default function WorkoutDayScreen() {
  const { day } = useParams<{ day: WorkoutDay }>();
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);

  const exercises = useLiveQuery(
    async () => {
      if (!day) {
        return [];
      }

      return listExercisesForDay(day);
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
  const shouldShowAddExerciseForm = exercises.length === 0 || isAddExerciseOpen;

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
      <AddExerciseForm
        day={day}
        isOpen={shouldShowAddExerciseForm}
        setIsOpen={setIsAddExerciseOpen}
      />

      {exercises.length === 0 ? (
        <EmptyState
          title="No exercises yet"
          description="Add your first movement above and its sets will show up here."
        />
      ) : (
        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              canMoveUp={index > 0}
              canMoveDown={index < exercises.length - 1}
              onMoveUp={() => void moveExerciseTemplate(exercise.id!, "up")}
              onMoveDown={() => void moveExerciseTemplate(exercise.id!, "down")}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
