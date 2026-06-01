import { Check, Trash2, Undo2 } from "lucide-react";
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
  TExerciseUnitType,
} from "../../app/db/table/exercise.table";
import { CompactNumberInput, IconButton, RowCard } from "../ui";

interface ISetRowProps {
  exerciseId: number;
  set: IExerciseSet;
  setNumber: number;
  exerciseType: TExerciseType;
  exerciseUnit: TExerciseUnitType;
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
    <RowCard className="flex items-center gap-2 p-2.5">
      <span className="w-10 shrink-0 text-center text-xs font-medium uppercase tracking-[0.14em] text-(--text-muted)">
        {String(setNumber).padStart(2, "0")}
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {exerciseType === "reps" ? (
          <>
            <CompactNumberInput
              type="number"
              value={set.weight ?? ""}
              placeholder={exerciseUnit}
              aria-label={`Set ${setNumber} weight in ${exerciseUnit}`}
              onChange={(e) =>
                updateExerciseSet(exerciseId, set.id, {
                  weight:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              className="w-24"
            />

            <CompactNumberInput
              type="number"
              value={set.reps ?? ""}
              placeholder="reps"
              aria-label={`Set ${setNumber} reps`}
              onChange={(e) =>
                updateExerciseSet(exerciseId, set.id, {
                  reps:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              className="w-24"
            />
          </>
        ) : (
          <CompactNumberInput
            type="number"
            value={set.time ?? ""}
            placeholder={exerciseUnit}
            aria-label={`Set ${setNumber} time in ${exerciseUnit}`}
            onChange={(e) =>
              updateExerciseSet(exerciseId, set.id, {
                time: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="flex-1"
          />
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {completedToday ? (
          <IconButton
            tone="success"
            size="sm"
            aria-label={`Undo completion for set ${setNumber}`}
            onClick={() => uncompleteExerciseSet(set.id)}
          >
            <Undo2 size={15} />
          </IconButton>
        ) : (
          <IconButton
            tone="secondary"
            size="sm"
            aria-label={`Mark set ${setNumber} as complete`}
            onClick={() => completeExerciseSet(exerciseId, set)}
          >
            <Check size={15} />
          </IconButton>
        )}

        <IconButton
          tone="ghost"
          size="sm"
          aria-label={`Delete set ${setNumber}`}
          onClick={() => deleteExerciseSet(exerciseId, set.id)}
        >
          <Trash2 size={15} />
        </IconButton>
      </div>
    </RowCard>
  );
}
