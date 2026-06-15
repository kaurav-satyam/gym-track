import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { addExerciseTemplateSet } from "../../../../app/db/repositories/exercise.repository";
import {
  listCompletedSetIdsForExerciseDay,
  listExerciseHistory,
} from "../../../../app/db/repositories/workout-log.repository";
import type { ExerciseTemplate } from "../../../../app/db/models/exercise.model";
import type { WorkoutSetLog } from "../../../../app/db/models/workout-log.model";
import { Button, Panel } from "../../../../shared/ui";
import ExerciseCardHeader from "./ExerciseCardHeader";
import ExerciseSetList from "./ExerciseSetList";

interface IExerciseCardProps {
  exercise: ExerciseTemplate;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function ExerciseCard({
  exercise,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: IExerciseCardProps) {
  const [expanded, setExpanded] = useState(true);
  const exerciseId = exercise.id!;
  const completedSetIds = useLiveQuery(
    () => listCompletedSetIdsForExerciseDay(exerciseId),
    [exerciseId],
    [],
  );
  const exerciseHistory = useLiveQuery(
    () => listExerciseHistory(exerciseId),
    [exerciseId],
    [],
  );
  const completedSetIdSet = new Set(completedSetIds);
  const latestLogBySetId = buildLatestLogBySetId(exerciseHistory);
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

function buildLatestLogBySetId(exerciseHistory: WorkoutSetLog[]) {
  const latestLogBySetId = new Map<string, WorkoutSetLog>();

  for (const log of exerciseHistory) {
    if (!latestLogBySetId.has(log.exerciseSetId)) {
      latestLogBySetId.set(log.exerciseSetId, log);
    }
  }

  return latestLogBySetId;
}
