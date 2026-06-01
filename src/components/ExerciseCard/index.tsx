import {
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Eye,
  Plus,
  Timer,
} from "lucide-react";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router";
import {
  addExerciseSet,
} from "../../app/db/repositories/exercise.repository";
import { listCompletedSetIdsByExerciseOnDate } from "../../app/db/repositories/workout-log.repository";
import type { IExerciseTable } from "../../app/db/table/exercise.table";
import SetRow from "./SetRow";

interface IExerciseCardProps {
  exercise: IExerciseTable;
}

export default function ExerciseCard({ exercise }: IExerciseCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const exerciseId = exercise.id!;
  const completedSetIds = useLiveQuery(
    () => listCompletedSetIdsByExerciseOnDate(exerciseId),
    [exerciseId],
    [],
  );
  const completedSetIdSet = new Set(completedSetIds);
  const totalSets = exercise.exerciseSets.length;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-white">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="
          flex
          w-full
          items-center
          justify-between
          px-4
          py-3
          transition
          hover:bg-zinc-900
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              bg-zinc-900
            "
          >
            {exercise.exerciseType === "reps" ? (
              <Dumbbell size={18} />
            ) : (
              <Timer size={18} />
            )}
          </div>

          <div className="text-left">
            <h2 className="text-sm font-semibold">{exercise.title}</h2>
            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                text-zinc-400
              "
            >
              <span>{exercise.exerciseType}</span>
              <span>•</span>
              <span>{exercise.exerciseUnit}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Eye onClick={() => navigate(`/logscreen/${exercise.id}`)} />
          <span className="text-xs text-zinc-500">{totalSets} sets</span>

          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800 p-3">
          <div className="space-y-2">
            {exercise.exerciseSets.map((set, index) => (
              <SetRow
                key={set.id}
                exerciseId={exerciseId}
                set={set}
                setNumber={index + 1}
                exerciseType={exercise.exerciseType}
                exerciseUnit={exercise.exerciseUnit}
                completedToday={completedSetIdSet.has(set.id)}
              />
            ))}
          </div>

          <button
            onClick={() => addExerciseSet(exerciseId)}
            className="
              mt-3
              flex
              h-9
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-dashed
              border-zinc-700
              text-sm
              text-zinc-400
              transition
              hover:bg-zinc-900
            "
          >
            <Plus size={14} />
            Add Set
          </button>
        </div>
      )}
    </div>
  );
}
