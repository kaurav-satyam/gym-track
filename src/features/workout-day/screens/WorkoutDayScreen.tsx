import { Copy, Dumbbell, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  copyDay,
  moveExerciseTemplate,
  removeExerciseTemplate,
  removeExerciseTemplates,
  restoreExercise,
} from "@/data/repositories/exercise.repository";
import type { PersistedExercise, WorkoutDay } from "@/domain/models/exercise";
import { WEEKDAYS, getTodayWorkoutDay, isWeekday } from "@/domain/weekdays";
import { showToast } from "@/shared/lib/toast";
import { useWakeLock } from "@/shared/lib/useWakeLock";
import { Card, ProgressRing, ScreenHeader, cn } from "@/shared/ui";
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

  // Mid-workout the phone shouldn't lock between sets.
  useWakeLock(day === today && !editMode && status.doneSets < status.totalSets);

  if (!exercises) {
    return null;
  }

  const { totalSets, doneSets, percent, firstUnfinishedId } = status;
  const expandedId =
    manualExpandedId === undefined ? firstUnfinishedId : manualExpandedId;
  const addExercisePath = `/days/${day}/add-exercise`;

  async function handleDelete(exercise: PersistedExercise) {
    const deleted = await removeExerciseTemplate(exercise.id);

    if (deleted) {
      showToast({
        message: `${exercise.title} deleted`,
        actionLabel: "Undo",
        onAction: () => void restoreExercise(deleted),
      });
    }
  }

  async function handleCopy(target: WorkoutDay) {
    const created = await copyDay(day, target);

    showToast({
      message: `Copied ${created.length} ${created.length === 1 ? "exercise" : "exercises"} to ${target}`,
      actionLabel: "Undo",
      onAction: () => void removeExerciseTemplates(created),
    });
  }

  const isToday = day === today;
  const setsLeft = totalSets - doneSets;

  // pb-28: room for the last card to scroll above the rest timer / toasts.
  return (
    <section className="motion-page mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      <header className="space-y-5">
        <ScreenHeader
          eyebrow={isToday ? `Today · ${formatToday()}` : "Weekly plan"}
          title={day}
          action={
            exercises.length > 0 && (
              <button
                type="button"
                className={cn(
                  "min-h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors",
                  editMode
                    ? "bg-(--accent) text-(--accent-ink)"
                    : "bg-(--surface-control) text-(--text-soft) hover:bg-(--surface-control-hover)",
                )}
                onClick={() => setEditMode((current) => !current)}
              >
                {editMode ? "Done" : "Edit"}
              </button>
            )
          }
        />

        <DayStrip today={today} />

        {totalSets > 0 && !editMode && (
          <Card className="flex items-center gap-4 p-4">
            <ProgressRing value={percent} size={60} strokeWidth={6}>
              <span className="text-sm font-bold tabular-nums text-(--text-strong)">{percent}%</span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="text-xl font-bold tabular-nums tracking-tight text-(--text-strong)">
                {doneSets}
                <span className="text-(--text-muted)"> / {totalSets} sets</span>
              </p>
              <p className="mt-0.5 text-sm text-(--text-muted)">
                {setsLeft === 0
                  ? "All done. Great session!"
                  : `${setsLeft} ${setsLeft === 1 ? "set" : "sets"} to go · ${exercises.length} ${exercises.length === 1 ? "exercise" : "exercises"}`}
              </p>
            </div>
          </Card>
        )}
      </header>

      {exercises.length === 0 ? (
        <Card className="mt-6 flex flex-col items-center px-6 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--accent-soft) text-(--accent)">
            <Dumbbell size={26} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-(--text-strong)">
            {isToday ? "Rest day?" : `Nothing planned for ${day}`}
          </h2>
          <p className="mt-1 max-w-64 text-sm text-(--text-muted)">
            Add exercises to build this day. They'll be ready for you every week.
          </p>
          <Link
            to={addExercisePath}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} /> Add exercise
          </Link>
        </Card>
      ) : (
        <>
          <ul className="mt-5 space-y-3">
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
                onDelete={() => void handleDelete(exercise)}
              />
            ))}
          </ul>

          {editMode && <CopyDayPicker from={day} onCopy={(target) => void handleCopy(target)} />}

          {!editMode && (
            <Link
              to={addExercisePath}
              className="mt-3 flex min-h-14 items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-(--surface-border) text-sm font-semibold text-(--text-soft) transition-colors hover:border-(--accent-border) hover:text-(--accent) active:scale-[0.99]"
            >
              <Plus size={18} /> Add exercise
            </Link>
          )}
        </>
      )}
    </section>
  );
}

function CopyDayPicker({ from, onCopy }: { from: WorkoutDay; onCopy: (to: WorkoutDay) => void }) {
  return (
    <Card className="mt-3 space-y-3 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-(--text-soft)">
        <Copy size={16} /> Copy this day to…
      </div>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((target) => (
          <button
            key={target}
            type="button"
            aria-label={`Copy ${from} to ${target}`}
            disabled={target === from}
            className="flex h-10 items-center justify-center rounded-xl bg-(--surface-control) text-sm font-semibold text-(--text-soft) transition active:scale-95 hover:bg-(--surface-control-hover) disabled:opacity-30"
            onClick={() => onCopy(target)}
          >
            {target.slice(0, 1)}
          </button>
        ))}
      </div>
    </Card>
  );
}

function formatToday() {
  return new Date().toLocaleDateString([], { day: "numeric", month: "long" });
}
