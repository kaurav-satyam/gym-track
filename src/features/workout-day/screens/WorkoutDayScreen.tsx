import { Plus } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  moveExerciseTemplate,
  removeExerciseTemplate,
} from "@/data/repositories/exercise.repository";
import type { PersistedExercise, WorkoutDay } from "@/domain/models/exercise";
import { getTodayWorkoutDay, isWeekday } from "@/domain/weekdays";
import { cn } from "@/shared/ui";
import DayStrip from "../components/DayStrip";
import ExerciseRow from "../components/ExerciseRow";
import { useWorkoutDay } from "../hooks/useWorkoutDay";

export default function WorkoutDayScreen() {
  const { day } = useParams<{ day: string }>();

  if (!isWeekday(day)) {
    return (
      <section className="mx-auto max-w-xl px-4 py-10 text-center text-(--text-muted)">
        That day doesn't exist. <Link className="text-(--accent)" to="/">Go to today</Link>
      </section>
    );
  }

  // Keyed so expansion/edit state resets when switching days.
  return <WorkoutDay key={day} day={day} />;
}

function WorkoutDay({ day }: { day: WorkoutDay }) {
  const today = getTodayWorkoutDay();
  const [editMode, setEditMode] = useState(false);
  // undefined = follow the first unfinished exercise automatically.
  const [manualExpandedId, setManualExpandedId] = useState<number | null>();

  const { exercises, completedSetIds, latestLogBySetId, status } = useWorkoutDay(day);

  if (!exercises) {
    return null;
  }

  const { totalSets, doneSets, percent, firstUnfinishedId } = status;
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
