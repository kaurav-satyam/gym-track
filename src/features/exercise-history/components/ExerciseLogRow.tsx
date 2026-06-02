import type {
  ExerciseType,
  ExerciseUnit,
} from "../../../app/db/models/exercise.model";
import type { WorkoutSetLog } from "../../../app/db/models/workout-log.model";
import { RowCard } from "../../../shared/ui";

interface IExerciseLogRowProps {
  log: WorkoutSetLog;
  exerciseType: ExerciseType;
  exerciseUnit: ExerciseUnit;
}

export default function ExerciseLogRow({
  log,
  exerciseType,
  exerciseUnit,
}: IExerciseLogRowProps) {
  return (
    <RowCard className="flex items-center justify-between gap-3 px-4 py-3">
      {exerciseType === "reps" ? (
        <div>
          <p className="text-base font-semibold text-(--text-strong)">
            {log.weight ?? "--"}
            {exerciseUnit}
          </p>
          <p className="text-sm text-(--text-muted)">{log.reps ?? "--"} reps</p>
        </div>
      ) : (
        <div>
          <p className="text-base font-semibold text-(--text-strong)">
            {log.time ?? "--"}
            {exerciseUnit}
          </p>
          <p className="text-sm text-(--text-muted)">Timed effort</p>
        </div>
      )}

      <span className="text-xs font-medium uppercase tracking-[0.16em] text-(--text-muted)">
        {log.completedAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </RowCard>
  );
}
