import { Calendar } from "lucide-react";
import type {
  ExerciseType,
  ExerciseUnit,
} from "../../../app/db/models/exercise.model";
import type { WorkoutSetLog } from "../../../app/db/models/workout-log.model";
import ExerciseLogRow from "./ExerciseLogRow";

interface IExerciseLogGroupProps {
  date: string;
  logs: WorkoutSetLog[];
  exerciseType: ExerciseType;
  exerciseUnit: ExerciseUnit;
}

export default function ExerciseLogGroup({
  date,
  logs,
  exerciseType,
  exerciseUnit,
}: IExerciseLogGroupProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-(--text-muted)">
        <Calendar size={16} />
        <h2>{date}</h2>
      </div>

      <div className="space-y-2">
        {logs.map((log) => (
          <ExerciseLogRow
            key={log.id}
            log={log}
            exerciseType={exerciseType}
            exerciseUnit={exerciseUnit}
          />
        ))}
      </div>
    </section>
  );
}
