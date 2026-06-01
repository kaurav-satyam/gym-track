import { useLiveQuery } from "dexie-react-hooks";
import {
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Eye,
  Plus,
  Timer,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { addExerciseSet } from "../../app/db/repositories/exercise.repository";
import { listCompletedSetIdsByExerciseOnDate } from "../../app/db/repositories/workout-log.repository";
import type { IExerciseTable } from "../../app/db/table/exercise.table";
import { Button, IconButton, Panel } from "../ui";
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
    <Panel className="overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-(--surface-border) bg-white/4 text-(--text-soft)">
            {exercise.exerciseType === "reps" ? (
              <Dumbbell size={18} />
            ) : (
              <Timer size={18} />
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <h2 className="truncate text-base font-semibold text-(--text-strong)">
              {exercise.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs text-(--text-muted)">
              <span className="capitalize">{exercise.exerciseType}</span>
              <span>•</span>
              <span>{exercise.exerciseUnit}</span>
              <span>•</span>
              <span>
                {totalSets} planned set{totalSets === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <IconButton
            size="sm"
            tone="secondary"
            aria-label={`View ${exercise.title} history`}
            onClick={() => navigate(`/logscreen/${exercise.id}`)}
          >
            <Eye size={16} />
          </IconButton>

          <IconButton
            size="sm"
            tone="secondary"
            aria-label={
              expanded
                ? `Collapse ${exercise.title}`
                : `Expand ${exercise.title}`
            }
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-(--surface-border) px-4 pb-4 pt-3 sm:px-5">
          {exercise.exerciseSets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-(--surface-border) px-4 py-5 text-center text-sm text-(--text-muted)">
              No sets added yet.
            </div>
          ) : (
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
          )}

          <Button
            tone="ghost"
            fullWidth
            className="mt-3"
            leadingIcon={<Plus size={16} />}
            onClick={() => addExerciseSet(exerciseId)}
          >
            Add set
          </Button>
        </div>
      )}
    </Panel>
  );
}
