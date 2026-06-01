import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { useParams } from "react-router";
import { listExercisesByDay } from "../../app/db/repositories/exercise.repository";
import type { TDay } from "../../app/db/table/exercise.table";
import AddExercise from "../../components/AddExercise";
import ExerciseCard from "../../components/ExerciseCard";

export default function DayScreen() {
  const { day } = useParams<{
    day: TDay;
  }>();

  const [isOpen, setIsOpen] = useState<boolean>(false);

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
    return <div className="p-6 text-red-400">Invalid day</div>;
  }

  const shouldShowAddExerciseForm = exercises.length === 0 || isOpen;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <AddExercise
        isOpen={shouldShowAddExerciseForm}
        setIsOpen={setIsOpen}
        day={day}
      />

      <div className="space-y-3">
        {exercises.length === 0 && (
          <div
            className="
              rounded-3xl border border-dashed
              border-zinc-800 bg-zinc-950 p-10
              text-center text-zinc-500
            "
          >
            No exercises added yet
          </div>
        )}

        {exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </div>
  );
}
