import type { InputHTMLAttributes } from "react";
import { Trash2 } from "lucide-react";
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
import type { IWorkoutSetLog } from "../../app/db/table/workout-log.table";
import { Button, IconButton, RowCard, cn } from "../ui";

interface ISetRowProps {
  exerciseId: number;
  set: IExerciseSet;
  setNumber: number;
  exerciseType: TExerciseType;
  exerciseUnit: TExerciseUnitType;
  previousLog?: IWorkoutSetLog;
  completedToday: boolean;
}

export default function SetRow({
  exerciseId,
  set,
  setNumber,
  exerciseType,
  exerciseUnit,
  previousLog,
  completedToday,
}: ISetRowProps) {
  const previousValue = formatPreviousValue({
    exerciseType,
    exerciseUnit,
    previousLog,
  });
  const hasPreviousValue = previousValue !== "--";

  return (
    <RowCard
      className={cn(
        "p-3 transition-colors sm:p-3.5",
        completedToday &&
          "border-emerald-400/30 bg-emerald-500/8 shadow-[0_10px_30px_rgba(6,78,59,0.18)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <div
            className={cn(
              "inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.08em]",
              completedToday
                ? "border-emerald-400/35 bg-emerald-500/12 text-emerald-100"
                : "border-(--surface-border) bg-black/20 text-(--text-strong)",
            )}
          >
            Set {setNumber}
          </div>

          <p className="truncate text-sm text-(--text-muted)">
            Previous{" "}
            <span
              className={cn(
                "font-medium",
                hasPreviousValue ? "text-(--text-soft)" : "text-(--text-muted)",
              )}
            >
              {previousValue}
            </span>
          </p>
        </div>

        <IconButton
          tone="ghost"
          size="sm"
          className="h-9 w-9 rounded-xl"
          aria-label={`Delete set ${setNumber}`}
          onClick={() => deleteExerciseSet(exerciseId, set.id)}
        >
          <Trash2 size={14} />
        </IconButton>
      </div>

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
            <ValueInput
              type="number"
              value={set.weight ?? ""}
              placeholder="0"
              suffix={exerciseUnit}
              aria-label={`Set ${setNumber} weight in ${exerciseUnit}`}
              onChange={(e) =>
                updateExerciseSet(exerciseId, set.id, {
                  weight:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />

            <ValueInput
              type="number"
              value={set.reps ?? ""}
              placeholder="0"
              suffix="reps"
              aria-label={`Set ${setNumber} reps`}
              onChange={(e) =>
                updateExerciseSet(exerciseId, set.id, {
                  reps:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />
          </>
        ) : (
          <ValueInput
            type="number"
            value={set.time ?? ""}
            placeholder="0"
            suffix={exerciseUnit}
            aria-label={`Set ${setNumber} time in ${exerciseUnit}`}
            onChange={(e) =>
              updateExerciseSet(exerciseId, set.id, {
                time: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
          />
        )}

        {completedToday ? (
          <Button
            tone="secondary"
            className="min-h-11 min-w-[6.75rem] shrink-0 rounded-xl border-emerald-400/30 bg-emerald-500/12 px-4 text-sm font-semibold whitespace-nowrap text-emerald-100 hover:bg-emerald-500/18"
            onClick={() => uncompleteExerciseSet(set.id)}
          >
            Undo
          </Button>
        ) : (
          <Button
            tone="primary"
            className="min-h-11 min-w-[6.75rem] shrink-0 rounded-xl px-4 text-sm font-semibold whitespace-nowrap"
            onClick={() => completeExerciseSet(exerciseId, set)}
          >
            Complete
          </Button>
        )}
      </div>
    </RowCard>
  );
}

interface IValueInputProps extends InputHTMLAttributes<HTMLInputElement> {
  suffix: string;
}

function ValueInput({ suffix, className, ...props }: IValueInputProps) {
  return (
    <div className="flex min-w-0 items-center overflow-hidden rounded-xl border border-(--surface-border) bg-black/20 transition focus-within:border-(--surface-border-strong)">
      <input
        className={cn(
          "h-11 min-w-0 flex-1 bg-transparent px-3 text-center text-sm font-medium text-(--text-strong) outline-none placeholder:text-(--text-muted) [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          className,
        )}
        inputMode="decimal"
        {...props}
      />
      <span className="flex h-11 shrink-0 items-center border-l border-(--surface-border) bg-white/[0.03] px-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-(--text-muted)">
        {suffix}
      </span>
    </div>
  );
}

interface IFormatPreviousValueArgs {
  exerciseType: TExerciseType;
  exerciseUnit: TExerciseUnitType;
  previousLog?: IWorkoutSetLog;
}

function formatPreviousValue({
  exerciseType,
  exerciseUnit,
  previousLog,
}: IFormatPreviousValueArgs) {
  if (!previousLog) {
    return "--";
  }

  if (exerciseType === "reps") {
    const weight = formatLoggedValue(previousLog.weight);
    const reps = formatLoggedValue(previousLog.reps);

    if (weight && reps) {
      return `${weight}${exerciseUnit}x${reps}`;
    }

    if (weight) {
      return `${weight}${exerciseUnit}`;
    }

    if (reps) {
      return `${reps} reps`;
    }

    return "--";
  }

  const time = formatLoggedValue(previousLog.time);

  return time ? `${time}${exerciseUnit}` : "--";
}

function formatLoggedValue(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "";
  }

  return Number.isInteger(value) ? String(value) : value.toString();
}
