import { Check } from "lucide-react";
import type {
  ExerciseSet,
  ExerciseType,
  ExerciseUnit,
} from "../../../../app/db/models/exercise.model";
import type { WorkoutSetLog } from "../../../../app/db/models/workout-log.model";
import { cn } from "../../../../shared/ui";
import ValueStepper from "./ValueStepper";
import { fieldsFor, formatSetValues, getStep, type SetField } from "../../../../shared/lib/setFormat";

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
        isNext && !editing && "bg-(--surface-control)",
        editing && "bg-(--surface-inset)",
      )}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 text-left"
          aria-expanded={editing}
          aria-label={`Edit set ${setNumber}`}
          onClick={onToggleEdit}
        >
          <span
            className={cn(
              "w-5 shrink-0 text-sm tabular-nums",
              isNext ? "font-semibold text-(--accent)" : "text-(--text-muted)",
            )}
          >
            {setNumber}
          </span>
          <span
            className={cn(
              "truncate text-base font-medium tabular-nums",
              done ? "text-(--text-muted)" : "text-(--text-strong)",
            )}
          >
            {formatSetValues(set, exerciseType, unit)}
          </span>
        </button>

        <button
          type="button"
          aria-label={done ? `Undo set ${setNumber}` : `Complete set ${setNumber}`}
          aria-pressed={done}
          className={cn(
            "mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-90",
            done
              ? "border-transparent bg-(--success) text-white"
              : isNext
                ? "border-(--accent) text-(--accent)"
                : "border-(--surface-border-strong) text-transparent",
          )}
          onClick={onToggleDone}
        >
          <Check size={18} strokeWidth={3} />
        </button>
      </div>

      {editing && (
        <div className="space-y-2 px-3 pb-3 pt-1">
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

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-(--text-muted)">
              {previousLog
                ? `Last: ${formatSetValues(previousLog, exerciseType, unit)}`
                : "No history yet"}
            </span>
            <button
              type="button"
              className="rounded-lg px-2 py-1 font-medium text-(--danger)"
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
