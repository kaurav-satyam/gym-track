import { Check, ChevronLeft, Dumbbell, Plus, Search, Timer } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import type { WorkoutDay } from "@/domain/models/exercise";
import type { ExerciseLibraryItem } from "@/domain/models/exercise-library";
import { isWeekday } from "@/domain/weekdays";
import { MuscleThumbnail, hasMuscleTargets } from "@/shared/muscle-map";
import { Card, SectionTitle, cn } from "@/shared/ui";
import { ALL_CATEGORIES, useExercisePicker } from "../hooks/useExercisePicker";


export default function AddExerciseScreen() {
  const { day } = useParams<{ day: string }>();

  if (!isWeekday(day)) {
    return (
      <section className="mx-auto max-w-xl px-4 py-10 text-center text-(--text-muted)">
        That day doesn't exist. <Link className="text-(--accent)" to="/">Go to today</Link>
      </section>
    );
  }

  return <ExercisePicker day={day} />;
}

function ExercisePicker({ day }: { day: WorkoutDay }) {
  const {
    query,
    setQuery,
    trimmedQuery,
    category,
    setCategory,
    categories,
    isBrowsing,
    results,
    recent,
    listed,
    showCreate,
    isPlanned,
    add,
    createAndAdd,
  } = useExercisePicker(day);

  return (
    <section className="motion-page mx-auto w-full max-w-xl px-4 pb-10">
      <header className="sticky top-[env(safe-area-inset-top)] z-10 -mx-4 space-y-3 border-b border-(--surface-card-border) bg-(--app-bg-start)/92 px-4 pb-3 pt-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <Link
            to={`/days/${day}`}
            aria-label={`Back to ${day}`}
            className="-ml-1 inline-flex min-h-9 items-center gap-1 rounded-full bg-(--surface-control) py-1 pl-2 pr-4 text-sm font-semibold text-(--text-soft) transition active:scale-95"
          >
            <ChevronLeft size={18} /> {day}
          </Link>
          <Link
            to={`/days/${day}`}
            className="inline-flex min-h-9 items-center rounded-full bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition active:scale-95"
          >
            Done
          </Link>
        </div>

        <h1 className="px-1 text-2xl font-bold tracking-tight text-(--text-strong)">Add exercise</h1>

        <label className="flex h-12 items-center gap-2.5 rounded-2xl border border-(--surface-card-border) bg-(--surface-card) px-4 shadow-(--shadow-card) transition-colors focus-within:border-(--accent-border)">
          <Search size={18} className="shrink-0 text-(--text-muted)" />
          <input
            autoFocus
            type="search"
            aria-label="Search exercises"
            placeholder="Search exercises"
            className="min-w-0 flex-1 bg-transparent text-base text-(--text-strong) outline-none placeholder:text-(--text-muted)"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        {categories.length > 0 && (
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none]">
            {[ALL_CATEGORIES, ...categories].map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={category === option}
                className={cn(
                  "min-h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition active:scale-95",
                  category === option
                    ? "bg-(--accent) text-(--accent-ink)"
                    : "bg-(--surface-control) text-(--text-soft) hover:bg-(--surface-control-hover)",
                )}
                onClick={() => setCategory(option)}
              >
                {option === ALL_CATEGORIES ? "All" : option}
              </button>
            ))}
          </div>
        )}
      </header>

      {recent.length > 0 && (
        <ExerciseList title="Recent" items={recent} isPlanned={isPlanned} onAdd={add} />
      )}

      {!results ? null : listed.length === 0 && !trimmedQuery ? (
        <p className="mt-10 text-center text-sm text-(--text-muted)">No exercises here yet.</p>
      ) : listed.length === 0 ? null : (
        <ExerciseList
          title={isBrowsing ? "All exercises" : undefined}
          items={listed}
          isPlanned={isPlanned}
          onAdd={add}
        />
      )}
      {showCreate && (
        <button
          type="button"
          className="mt-5 flex w-full items-center gap-3 rounded-3xl border-2 border-dashed border-(--accent-border) bg-(--accent-soft) p-4 text-left transition active:scale-[0.99]"
          onClick={() => void createAndAdd()}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--accent) text-(--accent-ink)">
            <Plus size={20} strokeWidth={2.5} />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-(--text-strong)">
              Create “{trimmedQuery}”
            </span>
            <span className="block text-sm text-(--text-muted)">
              Adds it to {day}. Set muscles later in its details.
            </span>
          </span>
        </button>
      )}
    </section>
  );
}

function ExerciseList({
  title,
  items,
  isPlanned,
  onAdd,
}: {
  title?: string;
  items: ExerciseLibraryItem[];
  isPlanned: (item: ExerciseLibraryItem) => boolean;
  onAdd: (item: ExerciseLibraryItem) => Promise<void>;
}) {
  return (
    <section className="mt-5">
      {title && <SectionTitle>{title}</SectionTitle>}
      <Card className="overflow-hidden">
        <ul className="divide-y divide-(--surface-card-border)">
          {items.map((item) => (
            <ExerciseOption key={item.id} item={item} planned={isPlanned(item)} onAdd={onAdd} />
          ))}
        </ul>
      </Card>
    </section>
  );
}

function ExerciseOption({
  item,
  planned,
  onAdd,
}: {
  item: ExerciseLibraryItem;
  planned: boolean;
  onAdd: (item: ExerciseLibraryItem) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <li className="flex items-center gap-3 px-3 py-2.5 [content-visibility:auto] [contain-intrinsic-size:auto_64px]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--surface-inset) p-1.5 text-(--text-soft)">
        {hasMuscleTargets(item.muscleTags) ? (
          <MuscleThumbnail tags={item.muscleTags} className="h-full w-auto max-w-full" />
        ) : item.exerciseType === "time" ? (
          <Timer size={18} />
        ) : (
          <Dumbbell size={18} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-(--text-strong)">{item.title}</span>
        <span className="block truncate text-sm text-(--text-muted)">
          {item.muscleTags.length > 0 ? item.muscleTags.join(", ") : item.category}
        </span>
      </span>
      <button
        type="button"
        aria-label={planned ? `${item.title} is planned` : `Add ${item.title}`}
        disabled={planned || busy}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition active:scale-90",
          planned
            ? "bg-(--success-soft) text-(--success)"
            : "bg-(--accent-soft) text-(--accent) hover:bg-(--accent) hover:text-(--accent-ink)",
        )}
        onClick={() => {
          setBusy(true);
          void onAdd(item).finally(() => setBusy(false));
        }}
      >
        {planned ? <Check size={18} strokeWidth={3} /> : <Plus size={20} strokeWidth={2.5} />}
      </button>
    </li>
  );
}
