import { Check } from "lucide-react";
import type {
  ExerciseSet,
  ExerciseType,
  ExerciseUnit,
} from "@/domain/models/exercise";
import type { WorkoutSetLog } from "@/domain/models/workout-log";
import { cn } from "@/shared/ui";
import ValueStepper from "./ValueStepper";
import { fieldsFor, formatSetValues, getStep, type SetField } from "@/domain/sets";

interface ISetRowProps {
  set: ExerciseSet;
  setNumber: number;
  exerciseType: ExerciseType;
  unit: ExerciseUnit;
  done: boolean;
  isNext: boolean;
  editing: boolean;
  previousLog?: WorkoutSetLog;
  onToggleEdit: () => void;
  onChange: (changes: Partial<Pick<ExerciseSet, SetField>>) => void;
  onToggleDone: () => void;
  onRemove: () => void;
}

const FIELD_LABELS: Record<SetField, string> = {
  weight: "Weight",
  reps: "Reps",
  time: "Time",
};

export default function SetRow({
  set,
  setNumber,
  exerciseType,
  unit,
  done,
  isNext,
  editing,
  previousLog,
  onToggleEdit,
  onChange,
  onToggleDone,
  onRemove,
}: ISetRowProps) {
  return (
    <li
      className={cn(
        "rounded-2xl transition-colors",
        isNext && !editing && "bg-(--accent-soft)",
        editing && "bg-(--surface-inset)",
      )}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-2xl px-2 text-left"
          aria-expanded={editing}
          aria-label={`Edit set ${setNumber}`}
          onClick={onToggleEdit}
        >
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums",
              done
                ? "bg-(--success-soft) text-(--success)"
                : isNext
                  ? "bg-(--accent) text-(--accent-ink)"
                  : "bg-(--surface-control) text-(--text-muted)",
            )}
          >
            {setNumber}
          </span>
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate text-[17px] font-semibold tabular-nums tracking-tight",
                done ? "text-(--text-muted)" : "text-(--text-strong)",
              )}
            >
              {formatSetValues(set, exerciseType, unit)}
            </span>
            {/* Once done today the latest log *is* today's, so only show it before. */}
            {previousLog && !done && (
              <span className="block truncate text-xs font-medium tabular-nums text-(--text-muted)">
                Last {formatSetValues(previousLog, exerciseType, unit)}
              </span>
            )}
          </span>
        </button>

        <button
          type="button"
          aria-label={done ? `Undo set ${setNumber}` : `Complete set ${setNumber}`}
          aria-pressed={done}
          className={cn(
            "mr-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-90",
            done
              ? "border-transparent bg-(--success) text-white"
              : isNext
                ? "border-transparent bg-(--accent) text-(--accent-ink) shadow-[0_6px_18px_var(--accent-soft)]"
                : "border-(--surface-border) text-(--surface-border-strong)",
          )}
          onClick={onToggleDone}
        >
          <Check size={18} strokeWidth={3} />
        </button>
      </div>

      {editing && (
        <div className="space-y-2 px-2 pb-3 pt-1">
          {fieldsFor(exerciseType).map((field) => (
            <ValueStepper
              key={field}
              label={FIELD_LABELS[field]}
              unit={field === "reps" ? "reps" : unit}
              value={set[field]}
              step={getStep(field, unit)}
              onChange={(value) => onChange({ [field]: value })}
            />
          ))}

          <div className="flex items-center justify-end pt-1 text-xs">
            <button
              type="button"
              className="rounded-full bg-(--danger-soft) px-3 py-1.5 font-semibold text-(--danger) transition active:scale-95"
              onClick={onRemove}
            >
              Remove set
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
