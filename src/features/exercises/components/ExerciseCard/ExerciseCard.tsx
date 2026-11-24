import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { addExerciseTemplateSet } from "../../../../app/db/repositories/exercise.repository";
import {
  listCompletedSetIdsForExerciseDay,
  listLatestLogsBySetId,
} from "../../../../app/db/repositories/workout-log.repository";
import type { WorkoutSetLog } from "../../../../app/db/models/workout-log.model";
import type { ExerciseTemplate } from "../../../../app/db/models/exercise.model";
import { Button, Panel } from "../../../../shared/ui";
import ExerciseCardHeader from "./ExerciseCardHeader";
import ExerciseSetList from "./ExerciseSetList";

interface IExerciseCardProps {
  exercise: ExerciseTemplate;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

const EMPTY_LOGS = new Map<string, WorkoutSetLog>();

export default function ExerciseCard({
  exercise,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDelete,
}: IExerciseCardProps) {
  const [expanded, setExpanded] = useState(true);
  const exerciseId = exercise.id!;
  const completedSetIds = useLiveQuery(
    () => listCompletedSetIdsForExerciseDay(exerciseId),
    [exerciseId],
    [],
  );
  const setIdsKey = exercise.exerciseSets.map((set) => set.id).join(",");
  const latestLogBySetId = useLiveQuery(
    () => listLatestLogsBySetId(setIdsKey ? setIdsKey.split(",") : []),
    [setIdsKey],
    EMPTY_LOGS,
  );
  // Logs of deleted template sets stay in history but don't count as progress.
  const currentSetIds = new Set(exercise.exerciseSets.map((set) => set.id));
  const completedSetIdSet = new Set(
    completedSetIds.filter((setId) => currentSetIds.has(setId)),
  );
  const totalSets = exercise.exerciseSets.length;

  return (
    <Panel className="overflow-hidden">
      <ExerciseCardHeader
        exercise={exercise}
        expanded={expanded}
        onToggle={() => setExpanded((prev) => !prev)}
        totalSets={totalSets}
        completedSetCount={completedSetIdSet.size}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
      />

      {expanded && (
        <div className="border-t border-(--surface-border) px-4 pb-4 pt-3 sm:px-5">
          {totalSets === 0 ? (
            <div className="rounded-2xl border border-dashed border-(--surface-border) px-4 py-5 text-center text-sm text-(--text-muted)">
              No sets added yet.
            </div>
          ) : (
            <ExerciseSetList
              exercise={exercise}
              exerciseId={exerciseId}
              completedSetIdSet={completedSetIdSet}
              latestLogBySetId={latestLogBySetId}
            />
          )}

          <Button
            tone="ghost"
            fullWidth
            className="mt-3"
            onClick={() => addExerciseTemplateSet(exerciseId)}
          >
            Add set
          </Button>
        </div>
      )}
    </Panel>
  );
}
