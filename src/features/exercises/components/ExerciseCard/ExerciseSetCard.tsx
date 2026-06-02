import { Button, RowCard, cn } from "../../../../shared/ui";
import {
  removeExerciseSet,
  updateExerciseTemplateSet,
} from "../../../../app/db/repositories/exercise.repository";
import {
  logExerciseSetCompletion,
  removeExerciseSetCompletion,
} from "../../../../app/db/repositories/workout-log.repository";
import type {
  ExerciseSet,
  ExerciseType,
  ExerciseUnit,
} from "../../../../app/db/models/exercise.model";
import type { WorkoutSetLog } from "../../../../app/db/models/workout-log.model";
import ExerciseSetCardHeader from "./ExerciseSetCardHeader";
import ExerciseSetValueInput from "./ExerciseSetValueInput";
import formatPreviousPerformance from "./formatPreviousPerformance";

interface IExerciseSetCardProps {
  exerciseId: number;
  set: ExerciseSet;
  setNumber: number;
  exerciseType: ExerciseType;
  exerciseUnit: ExerciseUnit;
  previousLog?: WorkoutSetLog;
  completedToday: boolean;
}

export default function ExerciseSetCard({
  exerciseId,
  set,
  setNumber,
  exerciseType,
  exerciseUnit,
  previousLog,
  completedToday,
}: IExerciseSetCardProps) {
  const previousValue = formatPreviousPerformance({
    exerciseType,
    exerciseUnit,
    previousLog,
  });

  return (
    <RowCard
      className={cn(
        "p-3 transition-colors sm:p-3.5",
        completedToday &&
          "border-emerald-400/30 bg-emerald-500/8 shadow-[0_10px_30px_rgba(6,78,59,0.18)]",
      )}
    >
      <ExerciseSetCardHeader
        setNumber={setNumber}
        previousValue={previousValue}
        completedToday={completedToday}
        onDelete={() => removeExerciseSet(exerciseId, set.id)}
      />

      <div
        className={cn(
          "mt-3 grid items-center gap-2",
          exerciseType === "reps"
            ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
            : "grid-cols-[minmax(0,1fr)_auto]",
        )}
      >
        {exerciseType === "reps" ? (
          <>
            <ExerciseSetValueInput
              type="number"
              value={set.weight ?? ""}
              placeholder="0"
              suffix={exerciseUnit}
              aria-label={`Set ${setNumber} weight in ${exerciseUnit}`}
              onChange={(event) =>
                updateExerciseTemplateSet(exerciseId, set.id, {
                  weight:
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                })
              }
            />

            <ExerciseSetValueInput
              type="number"
              value={set.reps ?? ""}
              placeholder="0"
              suffix="reps"
              aria-label={`Set ${setNumber} reps`}
              onChange={(event) =>
                updateExerciseTemplateSet(exerciseId, set.id, {
                  reps:
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                })
              }
            />
          </>
        ) : (
          <ExerciseSetValueInput
            type="number"
            value={set.time ?? ""}
            placeholder="0"
            suffix={exerciseUnit}
            aria-label={`Set ${setNumber} time in ${exerciseUnit}`}
            onChange={(event) =>
              updateExerciseTemplateSet(exerciseId, set.id, {
                time:
                  event.target.value === "" ? undefined : Number(event.target.value),
              })
            }
          />
        )}

        {completedToday ? (
          <Button
            tone="secondary"
            className="min-h-11 min-w-27 shrink-0 rounded-xl border-emerald-400/30 bg-emerald-500/12 px-4 text-sm font-semibold whitespace-nowrap text-emerald-100 hover:bg-emerald-500/18"
            onClick={() => removeExerciseSetCompletion(set.id)}
          >
            Undo
          </Button>
        ) : (
          <Button
            tone="primary"
            className="min-h-11 min-w-27 shrink-0 rounded-xl px-4 text-sm font-semibold whitespace-nowrap"
            onClick={() => logExerciseSetCompletion(exerciseId, set)}
          >
            Complete
          </Button>
        )}
      </div>
    </RowCard>
  );
}
