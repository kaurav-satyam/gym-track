import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Dumbbell,
  Info,
  Plus,
  Timer,
  Trash2,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { ExerciseTemplate, PersistedExercise } from "@/domain/models/exercise";
import type { WorkoutSetLog } from "@/domain/models/workout-log";
import {
  addExerciseTemplateSet,
  removeExerciseSet,
  restoreExerciseSet,
  updateExerciseTemplateSet,
} from "@/data/repositories/exercise.repository";
import {
  logExerciseSetCompletion,
  removeExerciseSetCompletion,
} from "@/data/repositories/workout-log.repository";
import {
  MuscleThumbnail,
  hasMuscleTargets,
} from "@/shared/muscle-map";
import { startRestTimer } from "@/features/rest-timer";
import { showToast } from "@/shared/lib/toast";
import { cn } from "@/shared/ui";
import SetRow from "./SetRow";

interface IExerciseRowProps {
  exercise: PersistedExercise;
  expanded: boolean;
  editMode: boolean;
  completedSetIds: ReadonlySet<string>;
  latestLogBySetId: ReadonlyMap<string, WorkoutSetLog>;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggle: () => void;
  onFinished: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export default function ExerciseRow({
  exercise,
  expanded,
  editMode,
  completedSetIds,
  latestLogBySetId,
  canMoveUp,
  canMoveDown,
  onToggle,
  onFinished,
  onMoveUp,
  onMoveDown,
  onDelete,
}: IExerciseRowProps) {
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const sets = exercise.exerciseSets;
  const doneCount = sets.filter((set) => completedSetIds.has(set.id)).length;
  const isComplete = sets.length > 0 && doneCount === sets.length;
  const nextSetId = sets.find((set) => !completedSetIds.has(set.id))?.id;
  const showBody = expanded && !editMode;

  async function toggleDone(setId: string) {
    const set = sets.find((item) => item.id === setId);

    if (!set) {
      return;
    }

    if (completedSetIds.has(setId)) {
      await removeExerciseSetCompletion(setId);
      return;
    }

    setEditingSetId(null);
    await logExerciseSetCompletion(exercise.id, set);
    navigator.vibrate?.(15);
    startRestTimer();

    if (doneCount + 1 === sets.length) {
      onFinished();
    }
  }

  async function removeSet(setId: string, setNumber: number) {
    setEditingSetId(null);
    const removed = await removeExerciseSet(exercise.id, setId);

    if (removed) {
      showToast({
        message: `Set ${setNumber} removed`,
        actionLabel: "Undo",
        onAction: () => void restoreExerciseSet(exercise.id, removed.set, removed.index),
      });
    }
  }

  const title = (
    <span
      className={cn(
        "block truncate text-[15px] font-semibold",
        isComplete && !showBody ? "text-(--text-muted)" : "text-(--text-strong)",
      )}
    >
      {exercise.title}
    </span>
  );

  return (
    <li
      className={cn(
        "overflow-hidden rounded-3xl border bg-(--surface-card) shadow-(--shadow-card) transition-colors",
        showBody ? "border-(--accent-border)" : "border-(--surface-card-border)",
      )}
    >
      {editMode ? (
        <div className="flex items-center gap-3 p-3.5">
          <span className="min-w-0 flex-1">{title}</span>
          <div className="flex shrink-0 items-center gap-1.5">
            <RowAction label={`Move ${exercise.title} up`} disabled={!canMoveUp} onClick={onMoveUp}>
              <ArrowUp size={16} />
            </RowAction>
            <RowAction label={`Move ${exercise.title} down`} disabled={!canMoveDown} onClick={onMoveDown}>
              <ArrowDown size={16} />
            </RowAction>
            <RowAction label={`Delete ${exercise.title}`} danger onClick={onDelete}>
              <Trash2 size={16} />
            </RowAction>
          </div>
        </div>
      ) : (
        // The whole header (icon, title, pips and chevron) is one tap target.
        <button
          type="button"
          className="flex w-full items-center gap-3 p-3.5 text-left"
          aria-expanded={showBody}
          aria-label={`${showBody ? "Collapse" : "Expand"} ${exercise.title}`}
          onClick={onToggle}
        >
          <ExerciseIcon exercise={exercise} />
          <span className="min-w-0 flex-1">
            {title}
            <span className="mt-1.5 flex items-center gap-2">
              {sets.length > 0 && (
                <span className="flex gap-1" aria-hidden="true">
                  {sets.map((set) => (
                    <span
                      key={set.id}
                      className={cn(
                        "h-1.5 w-4 rounded-full transition-colors",
                        completedSetIds.has(set.id) ? "bg-(--success)" : "bg-(--surface-control-hover)",
                      )}
                    />
                  ))}
                </span>
              )}
              <span className="text-xs font-medium tabular-nums text-(--text-muted)">
                {sets.length === 0 ? "No sets" : `${doneCount}/${sets.length}`}
              </span>
            </span>
          </span>
          {isComplete && !showBody ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--success-soft) text-(--success)">
              <Check size={18} strokeWidth={3} />
            </span>
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--surface-control) text-(--text-muted)">
              <ChevronDown
                size={18}
                className={cn("transition-transform duration-200", showBody && "rotate-180")}
              />
            </span>
          )}
        </button>
      )}

      {showBody && (
        <div className="border-t border-(--surface-card-border) px-2 pb-2 pt-2">
          <ul className="space-y-1">
            {sets.map((set, index) => (
              <SetRow
                key={set.id}
                set={set}
                setNumber={index + 1}
                exerciseType={exercise.exerciseType}
                unit={exercise.exerciseUnit}
                done={completedSetIds.has(set.id)}
                isNext={set.id === nextSetId}
                editing={editingSetId === set.id}
                previousLog={latestLogBySetId.get(set.id)}
                onToggleEdit={() =>
                  setEditingSetId((current) => (current === set.id ? null : set.id))
                }
                onChange={(changes) =>
                  void updateExerciseTemplateSet(exercise.id, set.id, changes)
                }
                onToggleDone={() => void toggleDone(set.id)}
                onRemove={() => void removeSet(set.id, index + 1)}
              />
            ))}
          </ul>

          <div className="mt-2 flex items-center justify-between gap-2 px-1">
            <button
              type="button"
              className="flex min-h-10 items-center gap-1.5 rounded-full bg-(--surface-control) px-4 text-sm font-semibold text-(--text-soft) transition active:scale-95 hover:bg-(--surface-control-hover)"
              onClick={() => void addExerciseTemplateSet(exercise.id, sets.at(-1))}
            >
              <Plus size={16} /> Add set
            </button>
            <Link
              to={`/exercises/${exercise.id}`}
              className="flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-(--text-muted) transition-colors hover:text-(--text-strong)"
            >
              <Info size={15} /> Details
            </Link>
          </div>
        </div>
      )}
    </li>
  );
}

function ExerciseIcon({ exercise }: { exercise: ExerciseTemplate }) {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-(--surface-inset) p-1.5 text-(--text-soft)">
      {hasMuscleTargets(exercise.muscleTags) ? (
        <MuscleThumbnail tags={exercise.muscleTags} className="h-full w-auto max-w-full" />
      ) : exercise.exerciseType === "time" ? (
        <Timer size={18} />
      ) : (
        <Dumbbell size={18} />
      )}
    </span>
  );
}

function RowAction({
  label,
  danger,
  disabled,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full transition active:scale-90 disabled:opacity-30",
        danger ? "bg-(--danger-soft) text-(--danger)" : "bg-(--surface-control) text-(--text-soft)",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
