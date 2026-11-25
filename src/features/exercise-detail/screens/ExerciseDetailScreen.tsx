import { ChevronLeft, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  removeExerciseTemplate,
  restoreExercise,
  updateExerciseTemplate,
} from "@/data/repositories/exercise.repository";
import { formatSessionDate } from "@/domain/history";
import {
  EXERCISE_TYPES,
  defaultUnitFor,
  unitsFor,
  type ExerciseTemplate,
  type ExerciseType,
  type PersistedExercise,
} from "@/domain/models/exercise";
import { formatSetValues } from "@/domain/sets";
import { showToast } from "@/shared/lib/toast";
import { MuscleTargetsPreview } from "@/shared/muscle-map";
import { Card, SectionTitle, SegmentedControl, cn } from "@/shared/ui";
import MuscleTagEditor from "../components/MuscleTagEditor";
import { useExercise, useExerciseHistory, useIsBuiltIn } from "../hooks/useExerciseDetail";

const SESSIONS_PREVIEW = 8;

export default function ExerciseDetailScreen() {
  const { exerciseId: param } = useParams<{ exerciseId: string }>();
  const exerciseId = Number(param);
  const exercise = useExercise(exerciseId);

  if (exercise === undefined) {
    return null;
  }

  if (exercise === null) {
    return (
      <section className="mx-auto max-w-xl px-4 py-10 text-center text-(--text-muted)">
        This exercise no longer exists.{" "}
        <Link className="text-(--accent)" to="/">
          Go to today
        </Link>
      </section>
    );
  }

  return <ExerciseDetail key={exercise.id} exercise={exercise} />;
}

function ExerciseDetail({ exercise }: { exercise: PersistedExercise }) {
  const navigate = useNavigate();
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [titleDraft, setTitleDraft] = useState(exercise.title);
  const { sessions, best } = useExerciseHistory(exercise);
  const isBuiltIn = useIsBuiltIn(exercise.title);
  const visibleSessions = showAllSessions ? sessions : sessions.slice(0, SESSIONS_PREVIEW);
  const unit = exercise.exerciseUnit;
  const units = unitsFor(exercise.exerciseType);

  function update(changes: Partial<ExerciseTemplate>) {
    void updateExerciseTemplate(exercise.id, changes);
  }

  function saveTitle() {
    const title = titleDraft.trim();

    if (title && title !== exercise.title) {
      update({ title });
    } else {
      setTitleDraft(exercise.title);
    }
  }

  function changeType(exerciseType: ExerciseType) {
    if (exerciseType !== exercise.exerciseType) {
      update({ exerciseType, exerciseUnit: defaultUnitFor(exerciseType) });
    }
  }

  async function handleDelete() {
    const deleted = await removeExerciseTemplate(exercise.id);

    navigate(`/days/${exercise.day}`, { replace: true });

    if (deleted) {
      showToast({
        message: `${exercise.title} deleted`,
        actionLabel: "Undo",
        onAction: () => void restoreExercise(deleted),
      });
    }
  }


  const tags = exercise.muscleTags ?? [];

  return (
    <section className="motion-page mx-auto w-full max-w-xl space-y-6 px-4 pb-10 pt-3">
      <header className="space-y-4">
        <Link
          to={`/days/${exercise.day}`}
          className="-ml-1 inline-flex min-h-9 items-center gap-1 rounded-full bg-(--surface-control) py-1 pl-2 pr-4 text-sm font-semibold text-(--text-soft) transition active:scale-95"
        >
          <ChevronLeft size={18} /> {exercise.day}
        </Link>
        <div>
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-(--text-strong)">
            {exercise.title}
          </h1>
          <p className="mt-1 text-sm font-medium text-(--text-muted)">
            {exercise.exerciseType === "time" ? "Timed" : "Weight × reps"} · {unit} ·{" "}
            {exercise.exerciseSets.length} {exercise.exerciseSets.length === 1 ? "set" : "sets"}
          </p>
        </div>
      </header>

      {tags.length > 0 && (
        <Card className="space-y-3 p-3">
          <MuscleTargetsPreview tags={tags} />
          <div className="flex flex-wrap gap-1.5 px-1 pb-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-(--surface-control) px-2.5 py-1 text-xs font-semibold text-(--text-soft)"
              >
                {tag}
              </span>
            ))}
          </div>
        </Card>
      )}

      <dl className="grid grid-cols-3 gap-2">
        <Stat label="Best">{best ? formatSetValues(best, exercise.exerciseType, unit) : "–"}</Stat>
        <Stat label="Sessions">{sessions.length}</Stat>
        <Stat label="Last">{sessions[0] ? formatSessionDate(sessions[0].date) : "–"}</Stat>
      </dl>

      <section>
        <SectionTitle>History</SectionTitle>
        <Card className="overflow-hidden">
          {sessions.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-(--text-muted)">
              Complete a set and it shows up here.
            </p>
          ) : (
            <ul className="divide-y divide-(--surface-card-border)">
              {visibleSessions.map((session) => (
                <li key={session.key} className="space-y-2 px-4 py-3">
                  <p className="text-sm font-semibold text-(--text-soft)">
                    {formatSessionDate(session.date)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {session.logs.map((log) => (
                      <span
                        key={log.id}
                        className="rounded-full bg-(--surface-control) px-2.5 py-1 text-[13px] font-semibold tabular-nums text-(--text-strong)"
                      >
                        {formatSetValues(log, exercise.exerciseType, unit)}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {sessions.length > SESSIONS_PREVIEW && (
            <button
              type="button"
              className="w-full border-t border-(--surface-card-border) py-3 text-sm font-semibold text-(--accent)"
              onClick={() => setShowAllSessions((current) => !current)}
            >
              {showAllSessions ? "Show less" : `Show all ${sessions.length} sessions`}
            </button>
          )}
        </Card>
      </section>

      <section>
        <SectionTitle>Settings</SectionTitle>
        <Card className="divide-y divide-(--surface-card-border)">
          <Setting label="Name" stacked>
            <input
              aria-label="Exercise name"
              className="h-11 w-full rounded-xl bg-(--surface-inset) px-3 font-medium text-(--text-strong) outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onBlur={saveTitle}
              onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
            />
          </Setting>

          <Setting label="Tracking">
            <SegmentedControl
              options={EXERCISE_TYPES.map((type) => ({
                label: type === "reps" ? "Reps" : "Time",
                value: type,
              }))}
              value={exercise.exerciseType}
              onChange={changeType}
            />
          </Setting>

          <Setting label="Unit">
            <SegmentedControl
              options={units.map((option) => ({ label: option, value: option }))}
              value={unit}
              onChange={(exerciseUnit) => update({ exerciseUnit })}
            />
          </Setting>

          {isBuiltIn === false && (
            <Setting label="Muscles" stacked>
              <MuscleTagEditor tags={tags} onChange={(muscleTags) => update({ muscleTags })} />
            </Setting>
          )}
        </Card>
      </section>

      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-(--danger-soft) text-sm font-semibold text-(--danger) transition active:scale-[0.99]"
        onClick={() => void handleDelete()}
      >
        <Trash2 size={16} /> Delete exercise
      </button>
    </section>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Card className="min-w-0 px-3 py-3">
      <dt className="text-xs font-medium text-(--text-muted)">{label}</dt>
      <dd className="mt-1 truncate text-[15px] font-bold tabular-nums tracking-tight text-(--text-strong)">
        {children}
      </dd>
    </Card>
  );
}

function Setting({
  label,
  stacked,
  children,
}: {
  label: string;
  stacked?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "px-4 py-3",
        stacked ? "space-y-2" : "flex items-center justify-between gap-3",
      )}
    >
      <p className="text-sm font-semibold text-(--text-soft)">{label}</p>
      {children}
    </div>
  );
}
