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

    if (doneCount + 1 === sets.length) {
      onFinished();
    }
  }

  return (
    <li
      className={cn(
        "overflow-hidden rounded-3xl bg-(--surface-panel) transition-colors",
        isComplete && !expanded && !editMode && "opacity-70",
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-expanded={showBody}
          disabled={editMode}
          onClick={onToggle}
        >
          <ExerciseIcon exercise={exercise} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-(--text-strong)">
              {exercise.title}
            </span>
            {!editMode && (
              <span className="block text-sm tabular-nums text-(--text-muted)">
                {sets.length === 0
                  ? "No sets"
                  : `${doneCount}/${sets.length} sets`}
              </span>
            )}
          </span>
        </button>

        {editMode ? (
          <div className="flex shrink-0 items-center gap-1">
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
        ) : isComplete ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--success) text-white">
            <Check size={16} strokeWidth={3} />
          </span>
        ) : (
          <ChevronDown
            size={18}
            className={cn(
              "shrink-0 text-(--text-muted) transition-transform",
              showBody && "rotate-180",
            )}
          />
        )}
      </div>

      {showBody && (
        <div className="px-2 pb-2">
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
                onRemove={() => {
                  setEditingSetId(null);
                  void removeExerciseSet(exercise.id, set.id);
                }}
              />
            ))}
          </ul>

          <div className="mt-1 flex items-center justify-between px-1">
            <button
              type="button"
              className="flex min-h-10 items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-(--text-soft)"
              onClick={() => void addExerciseTemplateSet(exercise.id, sets.at(-1))}
            >
              <Plus size={16} /> Add set
            </button>
            <Link
              to={`/exercises/${exercise.id}`}
              className="flex min-h-10 items-center gap-1.5 rounded-xl px-2 text-sm text-(--text-muted)"
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
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--surface-inset) p-1 text-(--text-soft)">
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
        "flex h-10 w-10 items-center justify-center rounded-xl bg-(--surface-control) disabled:opacity-30",
        danger ? "text-(--danger)" : "text-(--text-soft)",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
