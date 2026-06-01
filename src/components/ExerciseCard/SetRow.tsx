import { Check, Trash2, X } from "lucide-react";
import {
  deleteExerciseSet,
  updateExerciseSet,
} from "../../app/db/repositories/exercise.repository";
import {
  completeExerciseSet,
  uncompleteExerciseSet,
} from "../../app/db/repositories/workout-log.repository";
import type {
  IExerciseSet,
  TExerciseType,
} from "../../app/db/table/exercise.table";
import Button from "../Button";
import Input from "../Input";

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
          <Input
            type="number"
            value={set.weight ?? ""}
            placeholder={exerciseUnit}
            onChange={(e) =>
              updateExerciseSet(exerciseId, set.id, {
                weight:
                  e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="w-20"
          />

          <Input
            type="number"
            value={set.reps ?? ""}
            placeholder="reps"
            onChange={(e) =>
              updateExerciseSet(exerciseId, set.id, {
                reps:
                  e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="w-20"
          />
        </>
      ) : (
        <Input
          type="number"
          value={set.time ?? ""}
          placeholder={exerciseUnit}
          onChange={(e) =>
            updateExerciseSet(exerciseId, set.id, {
              time: e.target.value === "" ? undefined : Number(e.target.value),
            })
          }
        />
      )}

      {completedToday ? (
        <Button
          variant="success"
          size="sm"
          onClick={() => uncompleteExerciseSet(set.id)}
        >
          <X size={15} />
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => completeExerciseSet(exerciseId, set)}
        >
          <Check size={15} />
        </Button>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => deleteExerciseSet(exerciseId, set.id)}
      >
        <Trash2 size={15} />
      </Button>
    </div>
  );
}
