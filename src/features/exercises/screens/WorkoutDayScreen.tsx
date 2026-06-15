import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, ListChecks, Plus } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import {
  listExercisesForDay,
  moveExerciseTemplate,
} from "../../../app/db/repositories/exercise.repository";
import { listCompletedSetIdsForExerciseDay } from "../../../app/db/repositories/workout-log.repository";
import type {
  ExerciseTemplate,
  WorkoutDay,
} from "../../../app/db/models/exercise.model";
import {
  Button,
  EmptyState,
  PageShell,
  Panel,
  ProgressBar,
} from "../../../shared/ui";
import getTodayWorkoutDay from "../../../shared/lib/getTodayWorkoutDay";
import ExerciseCard from "../components/ExerciseCard";

export default function WorkoutDayScreen() {
  const { day } = useParams<{ day: WorkoutDay }>();
  const navigate = useNavigate();
  const today = useMemo(() => getTodayWorkoutDay(), []);

  const exercises = useLiveQuery(
    async () => {
      if (!day) {
        return [];
      }

      return listExercisesForDay(day);
    },
    [day],
    [],
  );

  const completedSetIds = useLiveQuery(
    async () => {
      const persistedExercises = exercises.filter(
        (exercise): exercise is ExerciseTemplate & { id: number } =>
          exercise.id != null,
      );
      const completedSetsByExercise = await Promise.all(
        persistedExercises.map((exercise) =>
          listCompletedSetIdsForExerciseDay(exercise.id!),
        ),
      );

      return completedSetsByExercise.flat();
    },
    [exercises],
    [],
  );

  if (!day) {
    return (
      <PageShell title="Day not found">
        <EmptyState
          title="Invalid day"
          description="Pick one of the weekdays from the week screen and try again."
        />
      </PageShell>
    );
  }

  const addExercisePath = "/days/" + day + "/add-exercise";
  const isToday = day === today;
  const exerciseCountLabel = `${exercises.length} exercise${exercises.length === 1 ? "" : "s"}`;
  const plannedSetCount = exercises.reduce(
    (total, exercise) => total + exercise.exerciseSets.length,
    0,
  );
  const completedSetCount = new Set(completedSetIds).size;
  const completionPercent =
    plannedSetCount === 0 ? 0 : (completedSetCount / plannedSetCount) * 100;

  return (
    <PageShell
      eyebrow={isToday ? "Today" : "Workout day"}
      title={isToday ? `${day} workout` : day}
      description={
        exercises.length > 0
          ? `${exerciseCountLabel} planned. Capture each set as you finish it.`
          : "Start this day by choosing a movement from the exercise library."
      }
      actions={
        exercises.length > 0 ? (
          <Button
            tone="primary"
            leadingIcon={<Plus size={16} />}
            onClick={() => navigate(addExercisePath)}
          >
            Add exercise
          </Button>
        ) : undefined
      }
    >
      <SessionSummaryPanel
        completedSetCount={completedSetCount}
        exerciseCount={exercises.length}
        plannedSetCount={plannedSetCount}
        completionPercent={completionPercent}
      />

      {exercises.length === 0 ? (
        <EmptyState
          title="No exercises yet"
          description="Open the exercise library, search a movement, then expand its card to set up tracking details."
          action={
            <Button
              tone="primary"
              leadingIcon={<Plus size={16} />}
              onClick={() => navigate(addExercisePath)}
            >
              Add exercise
            </Button>
          }
        />
      ) : (
        <div className="motion-list space-y-3">
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              canMoveUp={index > 0}
              canMoveDown={index < exercises.length - 1}
              onMoveUp={() => void moveExerciseTemplate(exercise.id!, "up")}
              onMoveDown={() => void moveExerciseTemplate(exercise.id!, "down")}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function SessionSummaryPanel({
  exerciseCount,
  plannedSetCount,
  completedSetCount,
  completionPercent,
}: {
  exerciseCount: number;
  plannedSetCount: number;
  completedSetCount: number;
  completionPercent: number;
}) {
  return (
    <Panel className="p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr]">
        <SummaryMetric
          icon={<ListChecks size={17} />}
          label="Exercises"
          value={String(exerciseCount)}
        />
        <SummaryMetric
          icon={<CheckCircle2 size={17} />}
          label="Sets done"
          value={`${completedSetCount}/${plannedSetCount}`}
        />
        <div className="rounded-2xl border border-(--surface-border) bg-black/10 px-4 py-3">
          <ProgressBar value={completionPercent} label="Session progress" />
        </div>
      </div>
    </Panel>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-(--surface-border) bg-black/10 px-4 py-3">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-(--text-muted)">
          {label}
        </p>
        <p className="mt-1 text-xl font-semibold text-(--text-strong)">
          {value}
        </p>
      </div>
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-(--surface-border) bg-white/4 text-(--text-soft)">
        {icon}
      </span>
    </div>
  );
}
