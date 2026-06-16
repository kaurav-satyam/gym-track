import { Dumbbell } from "lucide-react";
import type {
  ExerciseType,
  ExerciseUnit,
} from "../../../app/db/models/exercise.model";
import { Badge, Panel } from "../../../shared/ui";

interface IExerciseHistorySummaryProps {
  exerciseType: ExerciseType;
  exerciseUnit: ExerciseUnit;
}

export default function ExerciseHistorySummary({
  exerciseType,
  exerciseUnit,
}: IExerciseHistorySummaryProps) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-(--surface-border) bg-(--surface-control) text-(--text-soft)">
          <Dumbbell size={20} />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-(--text-soft)">Saved exercise details</p>
            <p className="mt-1 text-sm leading-6 text-(--text-muted)">
              Review the planned unit and compare it against the completed log entries below.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge tone="soft">{exerciseType}</Badge>
            <Badge tone="soft">{exerciseUnit}</Badge>
          </div>
        </div>
      </div>
    </Panel>
  );
}
