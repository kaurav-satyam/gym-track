import { useLiveQuery } from "dexie-react-hooks";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import type {
  ExerciseTemplate,
  WorkoutDay,
} from "../../../app/db/models/exercise.model";
import type { WorkoutSetLog } from "../../../app/db/models/workout-log.model";
import {
  listExercisesForDay,
  moveExerciseTemplate,
  removeExerciseTemplate,
} from "../../../app/db/repositories/exercise.repository";
import {
  listCompletedSetIdsForExerciseDay,
  listLatestLogsBySetId,
} from "../../../app/db/repositories/workout-log.repository";
import { WEEKDAYS } from "../../../shared/constants/weekdays";
import getTodayWorkoutDay from "../../../shared/lib/getTodayWorkoutDay";
import { cn } from "../../../shared/ui";
import DayStrip from "../components/workout/DayStrip";
import ExerciseRow from "../components/workout/ExerciseRow";

type PersistedExercise = ExerciseTemplate & { id: number };

const EMPTY_PROGRESS = {
  completedSetIds: new Set<string>() as ReadonlySet<string>,
  latestLogBySetId: new Map<string, WorkoutSetLog>() as ReadonlyMap<string, WorkoutSetLog>,
};

export default function WorkoutDayScreen() {
  const { day } = useParams<{ day: string }>();

  if (!day || !(WEEKDAYS as readonly string[]).includes(day)) {
    return (
      <section className="mx-auto max-w-xl px-4 py-10 text-center text-(--text-muted)">
        That day doesn't exist. <Link className="text-(--accent)" to="/">Go to today</Link>
      </section>
    );
  }

  // Keyed so expansion/edit state resets when switching days.
  return <WorkoutDay key={day} day={day as WorkoutDay} />;
}

function WorkoutDay({ day }: { day: WorkoutDay }) {
  const today = getTodayWorkoutDay();
  const [editMode, setEditMode] = useState(false);
  // undefined = follow the first unfinished exercise automatically.
  const [manualExpandedId, setManualExpandedId] = useState<number | null>();

  const exercises = useLiveQuery(
    async () =>
      (await listExercisesForDay(day)).filter(
        (exercise): exercise is PersistedExercise => exercise.id != null,
      ),
    [day],
  );

  // Re-query only when the exercise/set structure changes, not on value edits.
  const structureKey = (exercises ?? [])
    .map((exercise) => `${exercise.id}:${exercise.exerciseSets.map((set) => set.id).join(".")}`)
    .join("|");
  const progress =
    useLiveQuery(async () => {
      const entries = structureKey ? structureKey.split("|") : [];
      const exerciseIds = entries.map((entry) => Number(entry.split(":")[0]));
      const setIds = entries.flatMap((entry) => entry.split(":")[1].split(".").filter(Boolean));
      const [completed, latestLogBySetId] = await Promise.all([
        Promise.all(exerciseIds.map((id) => listCompletedSetIdsForExerciseDay(id))),
        listLatestLogsBySetId(setIds),
      ]);

      return {
        completedSetIds: new Set(completed.flat()) as ReadonlySet<string>,
        latestLogBySetId: latestLogBySetId as ReadonlyMap<string, WorkoutSetLog>,
      };
    }, [structureKey]) ?? EMPTY_PROGRESS;

  if (!exercises) {
    return null;
  }

  const { completedSetIds, latestLogBySetId } = progress;
  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.exerciseSets.length, 0);
  const doneSets = exercises.reduce(
    (sum, exercise) =>
      sum + exercise.exerciseSets.filter((set) => completedSetIds.has(set.id)).length,
    0,
  );
  const percent = totalSets === 0 ? 0 : Math.round((doneSets / totalSets) * 100);
  const firstUnfinishedId = exercises.find((exercise) =>
    exercise.exerciseSets.some((set) => !completedSetIds.has(set.id)),
  )?.id;
  const expandedId =
    manualExpandedId === undefined ? firstUnfinishedId : manualExpandedId;
  const addExercisePath = `/days/${day}/add-exercise`;

  function handleDelete(exercise: PersistedExercise) {
    if (window.confirm(`Delete ${exercise.title}? Its logged sets are removed too.`)) {
      void removeExerciseTemplate(exercise.id);
    }
  }

  return (
    <section className="motion-page mx-auto w-full max-w-xl px-4 pb-8 pt-5">
      <header className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-(--text-muted)">{day === today ? "Today" : "Plan"}</p>
            <h1 className="text-3xl font-semibold tracking-tight text-(--text-strong)">{day}</h1>
          </div>
          {exercises.length > 0 && (
            <button
              type="button"
              className={cn(
                "min-h-10 rounded-xl px-3 text-sm font-medium",
                editMode ? "bg-(--accent) text-(--accent-ink)" : "text-(--text-soft) hover:bg-(--surface-control)",
              )}
              onClick={() => setEditMode((current) => !current)}
            >
              {editMode ? "Done" : "Edit"}
            </button>
          )}
        </div>

        <DayStrip today={today} />

        {totalSets > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm tabular-nums">
              <span className="text-(--text-soft)">
                {doneSets}/{totalSets} sets
              </span>
              <span className="text-(--text-muted)">{percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-(--surface-control)">
              <div
                className="h-full rounded-full bg-(--accent) transition-[width] duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {exercises.length === 0 ? (
        <div className="mt-12 space-y-4 text-center">
          <p className="text-(--text-muted)">Nothing planned for {day}.</p>
          <AddExerciseLink to={addExercisePath} />
        </div>
      ) : (
        <>
          <ul className="mt-5 space-y-2">
            {exercises.map((exercise, index) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                expanded={expandedId === exercise.id}
                editMode={editMode}
                completedSetIds={completedSetIds}
                latestLogBySetId={latestLogBySetId}
                canMoveUp={index > 0}
                canMoveDown={index < exercises.length - 1}
                onToggle={() =>
                  setManualExpandedId(expandedId === exercise.id ? null : exercise.id)
                }
                // Hand control back to auto mode so the next exercise opens.
                onFinished={() => setManualExpandedId(undefined)}
                onMoveUp={() => void moveExerciseTemplate(exercise.id, "up")}
                onMoveDown={() => void moveExerciseTemplate(exercise.id, "down")}
                onDelete={() => handleDelete(exercise)}
              />
            ))}
          </ul>

          {!editMode && (
            <div className="mt-4 flex justify-center">
              <AddExerciseLink to={addExercisePath} />
            </div>
          )}
        </>
      )}
    </section>
  );
}

function AddExerciseLink({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-(--surface-control) px-4 text-sm font-medium text-(--text-strong) hover:bg-(--surface-control-hover)"
    >
      <Plus size={16} /> Add exercise
    </Link>
  );
}
