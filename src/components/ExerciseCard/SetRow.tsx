import { Check, Trash2, X } from "lucide-react";

import { deleteSet, updateSet } from "../../app/db/service/exercise.repository";
import {
  completeSet,
  uncompleteSet,
} from "../../app/db/service/workout-log.repository";
import type {
  IExerciseSet,
  TExerciseType,
} from "../../app/db/table/exercise.table";

interface ISetRowProps {
  exerciseId: number;
  set: IExerciseSet;
  setNumber: number;
  exerciseType: TExerciseType;
  exerciseUnit: string;
  completedToday: boolean;
}

export default function SetRow({
  exerciseId,
  set,
  setNumber,
  exerciseType,
  exerciseUnit,
  completedToday,
}: ISetRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-zinc-900 p-2">
      <span className="w-8 shrink-0 text-xs font-medium text-zinc-500">
        #{setNumber}
      </span>

      {exerciseType === "reps" ? (
        <>
          <input
            type="number"
            value={set.weight ?? ""}
            placeholder={exerciseUnit}
            onChange={(e) =>
              updateSet(exerciseId, set.id, {
                weight:
                  e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="
              h-9
              w-20
              rounded-md
              border
              border-zinc-700
              bg-black
              px-2
              text-sm
              outline-none
              focus:border-white
            "
          />

          <input
            type="number"
            value={set.reps ?? ""}
            placeholder="reps"
            onChange={(e) =>
              updateSet(exerciseId, set.id, {
                reps:
                  e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="
              h-9
              w-20
              rounded-md
              border
              border-zinc-700
              bg-black
              px-2
              text-sm
              outline-none
              focus:border-white
            "
          />
        </>
      ) : (
        <input
          type="number"
          value={set.time ?? ""}
          placeholder={exerciseUnit}
          onChange={(e) =>
            updateSet(exerciseId, set.id, {
              time: e.target.value === "" ? undefined : Number(e.target.value),
            })
          }
          className="
            h-9
            flex-1
            rounded-md
            border
            border-zinc-700
            bg-black
            px-2
            text-sm
            outline-none
            focus:border-white
          "
        />
      )}

      {completedToday ? (
        <button
          onClick={() => uncompleteSet(set.id)}
          className="
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-md
        bg-green-600
        text-white
      "
        >
          <X size={15} />
        </button>
      ) : (
        <button
          onClick={() => completeSet(exerciseId, set)}
          className="
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-md
        bg-zinc-800
        text-zinc-400
        hover:bg-green-600
        hover:text-white
      "
        >
          <Check size={15} />
        </button>
      )}

      <button
        onClick={() => deleteSet(exerciseId, set.id)}
        className="
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-md
          bg-zinc-800
          text-zinc-400
          transition
          hover:bg-red-600
          hover:text-white
        "
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
