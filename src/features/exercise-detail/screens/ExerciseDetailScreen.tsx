import { useLiveQuery } from "dexie-react-hooks";
import { ChevronLeft } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  EXERCISE_TIME_UNITS,
  EXERCISE_TYPES,
  EXERCISE_WEIGHT_UNITS,
  type ExerciseTemplate,
  type ExerciseType,
} from "../../../app/db/models/exercise.model";
import {
  getExerciseById,
  removeExerciseTemplate,
  updateExerciseTemplate,
} from "../../../app/db/repositories/exercise.repository";
import { listExerciseHistory } from "../../../app/db/repositories/workout-log.repository";
import { formatSetValues } from "../../../shared/lib/setFormat";
import { MuscleTargetsPreview } from "../../../shared/muscle-map";
import { SegmentedControl } from "../../../shared/ui";
import MuscleTagEditor from "../components/MuscleTagEditor";
import { formatSessionDate, summarizeHistory } from "../lib/summarizeHistory";

const SESSIONS_PREVIEW = 8;

export default function ExerciseDetailScreen() {
  const { exerciseId: param } = useParams<{ exerciseId: string }>();
  const exerciseId = Number(param);
  const exercise = useLiveQuery(
    async () => (Number.isFinite(exerciseId) ? (await getExerciseById(exerciseId)) ?? null : null),
    [exerciseId],
  );

  if (exercise === undefined) {
    return null;
  }

  if (exercise === null || exercise.id == null) {
    return (
      <section className="mx-auto max-w-xl px-4 py-10 text-center text-(--text-muted)">
        This exercise no longer exists.{" "}
        <Link className="text-(--accent)" to="/">
          Go to today
        </Link>
      </section>
    );
  }

  return <ExerciseDetail key={exercise.id} exercise={exercise as ExerciseTemplate & { id: number }} />;
}

function ExerciseDetail({ exercise }: { exercise: ExerciseTemplate & { id: number } }) {
  const navigate = useNavigate();
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [titleDraft, setTitleDraft] = useState(exercise.title);
  const logs = useLiveQuery(() => listExerciseHistory(exercise.id), [exercise.id], []);
  const { sessions, best } = summarizeHistory(logs, exercise.exerciseType);
  const visibleSessions = showAllSessions ? sessions : sessions.slice(0, SESSIONS_PREVIEW);
  const unit = exercise.exerciseUnit;
  const units = exercise.exerciseType === "time" ? EXERCISE_TIME_UNITS : EXERCISE_WEIGHT_UNITS;

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
      update({ exerciseType, exerciseUnit: exerciseType === "time" ? "sec" : "kg" });
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${exercise.title}? Its logged sets are removed too.`)) {
      return;
    }

    await removeExerciseTemplate(exercise.id);
    navigate(`/days/${exercise.day}`, { replace: true });
  }

  return (
    <section className="motion-page mx-auto w-full max-w-xl space-y-7 px-4 pb-10 pt-4">
      <header className="space-y-3">
        <Link
          to={`/days/${exercise.day}`}
          className="-ml-2 inline-flex min-h-10 items-center gap-1 rounded-xl px-2 text-sm text-(--text-muted)"
        >
          <ChevronLeft size={18} /> {exercise.day}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-(--text-strong)">
          {exercise.title}
        </h1>
        <MuscleTargetsPreview tags={exercise.muscleTags} />
      </header>

      <dl className="grid grid-cols-3 gap-3">
        <Stat label="Best">{best ? formatSetValues(best, exercise.exerciseType, unit) : "–"}</Stat>
        <Stat label="Sessions">{sessions.length}</Stat>
        <Stat label="Last">{sessions[0] ? formatSessionDate(sessions[0].date) : "–"}</Stat>
      </dl>

      <Section title="History">
        {sessions.length === 0 ? (
          <p className="text-sm text-(--text-muted)">Complete a set and it shows up here.</p>
        ) : (
          <ul className="divide-y divide-(--surface-border)">
            {visibleSessions.map((session) => (
              <li key={session.key} className="flex gap-4 py-3">
                <span className="w-24 shrink-0 text-sm text-(--text-muted)">
                  {formatSessionDate(session.date)}
                </span>
                <span className="min-w-0 text-sm tabular-nums text-(--text-strong)">
                  {session.logs
                    .map((log) => formatSetValues(log, exercise.exerciseType, unit))
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        )}
        {sessions.length > SESSIONS_PREVIEW && (
          <button
            type="button"
            className="mt-1 min-h-9 text-sm font-medium text-(--accent)"
            onClick={() => setShowAllSessions((current) => !current)}
          >
            {showAllSessions ? "Show less" : `Show all ${sessions.length} sessions`}
          </button>
        )}
      </Section>

      <Section title="Settings">
        <div className="space-y-5">
          <Setting label="Name">
            <input
              className="h-11 w-full rounded-xl bg-(--surface-control) px-3 text-(--text-strong) outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
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

          <Setting label="Muscles">
            <MuscleTagEditor
              tags={exercise.muscleTags ?? []}
              onChange={(muscleTags) => update({ muscleTags })}
            />
          </Setting>

          <button
            type="button"
            className="min-h-11 text-sm font-medium text-(--danger)"
            onClick={() => void handleDelete()}
          >
            Delete exercise
          </button>
        </div>
      </Section>
    </section>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-(--text-muted)">{label}</dt>
      <dd className="mt-0.5 truncate font-semibold tabular-nums text-(--text-strong)">{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-(--text-soft)">{title}</h2>
      {children}
    </section>
  );
}

function Setting({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-(--text-muted)">{label}</p>
      {children}
    </div>
  );
}
