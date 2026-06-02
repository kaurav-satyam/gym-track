import type { ExerciseTemplate } from "../../../../app/db/models/exercise.model";
import type { WorkoutSetLog } from "../../../../app/db/models/workout-log.model";
import ExerciseSetCard from "./ExerciseSetCard";

interface IExerciseSetListProps {
  exercise: ExerciseTemplate;
  exerciseId: number;
  completedSetIdSet: Set<string>;
  latestLogBySetId: Map<string, WorkoutSetLog>;
}

export default function ExerciseSetList({
  exercise,
  exerciseId,
  completedSetIdSet,
  latestLogBySetId,
}: IExerciseSetListProps) {
  return (
    <div className="space-y-2.5">
      {exercise.exerciseSets.map((set, index) => (
        <ExerciseSetCard
          key={set.id}
          exerciseId={exerciseId}
          set={set}
          setNumber={index + 1}
          exerciseType={exercise.exerciseType}
          exerciseUnit={exercise.exerciseUnit}
          previousLog={latestLogBySetId.get(set.id)}
          completedToday={completedSetIdSet.has(set.id)}
        />
      ))}
    </div>
  );
}
