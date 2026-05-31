import { useLiveQuery } from "dexie-react-hooks";
import { useParams } from "react-router";

import { db } from "../../app/db";

import type { TDay } from "../../app/db/table/exercise.table";

import { useEffect, useState } from "react";
import AddExercise from "../../components/AddExercise";
import ExerciseCard from "../../components/ExerciseCard";

export default function DayScreen() {
  const { day } = useParams<{
    day: TDay;
  }>();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const exercises = useLiveQuery(
    async () => {
      if (!day) return [];

      return await db.exercises.where("day").equals(day).reverse().sortBy("id");
    },
    [day],
    [],
  );

  useEffect(() => {
    setIsOpen(exercises.length ? false : true);
  }, [exercises]);

  if (!day) {
    return <div className="p-6 text-red-400">Invalid day</div>;
  }



  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      {/* Add Exercise Card */}
      <AddExercise isOpen={isOpen} setIsOpen={setIsOpen} day={day} />

      {/* Exercise List */}
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
          <ExerciseCard exercise={exercise} />
        ))}
      </div>
    </div>
  );
}
