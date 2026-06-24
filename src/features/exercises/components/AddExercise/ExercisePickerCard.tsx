import type { ReactNode } from "react";
import { Check, ChevronDown, Dumbbell, Plus, Timer } from "lucide-react";
import type {
  ExerciseLibraryItem,
} from "../../../../app/db/models/exercise-library.model";
import {
  EXERCISE_TIME_UNITS,
  EXERCISE_WEIGHT_UNITS,
  type ExerciseUnit,
} from "../../../../app/db/models/exercise.model";
import {
  Button,
  Field,
  Panel,
  SegmentedControl,
  SelectField,
  TextField,
  cn,
} from "../../../../shared/ui";
import {
  addUniqueTag,
  exerciseTypeOptions,
  toggleTag,
  type ExerciseSetupState,
} from "./addExerciseModel";

interface ExercisePickerCardProps {
  exercise: ExerciseLibraryItem;
  expanded: boolean;
  setupState: ExerciseSetupState;
  setSetupState: (nextState: ExerciseSetupState) => void;
  defaultMuscleTags: string[];
  onToggle: () => void;
  onSave: () => void;
}

export default function ExercisePickerCard({
  exercise,
  expanded,
  setupState,
  setSetupState,
  defaultMuscleTags,
  onToggle,
  onSave,
}: ExercisePickerCardProps) {
  const isRepsExercise = setupState.exerciseType === "reps";
  const displayUnits = isRepsExercise
    ? EXERCISE_WEIGHT_UNITS
    : EXERCISE_TIME_UNITS;
  const cardExerciseType = expanded
    ? setupState.exerciseType
    : exercise.exerciseType;
  const cardExerciseUnit = expanded
    ? setupState.exerciseUnit
    : exercise.exerciseUnit;
  const cardSetCount = expanded ? setupState.plannedSetCount : "3";
  const cardMuscleTags = expanded
    ? setupState.muscleTags
    : (exercise.muscleTags ?? []);

  return (
    <Panel className="overflow-hidden">
      <button
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition duration-200 hover:bg-(--surface-control) sm:px-4"
        type="button"
        onClick={onToggle}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-(--surface-inset)",
              exercise.exerciseType === "reps"
                ? "border-(--type-reps-border) text-(--type-reps-text)"
                : "border-(--type-time-border) text-(--type-time-text)",
            )}
          >
            {exercise.exerciseType === "reps" ? (
              <Dumbbell size={17} />
            ) : (
              <Timer size={17} />
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate text-sm font-semibold text-(--text-strong) sm:text-base">
                {exercise.title}
              </h2>
              {!exercise.isBuiltIn && (
                <span className="shrink-0 rounded-full border border-(--surface-border) px-2 py-0.5 text-[10px] font-medium text-(--text-muted)">
                  Custom
                </span>
              )}
            </div>

            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-muted)">
              {cardExerciseType} · {cardExerciseUnit} · {cardSetCount || "0"}{" "}
              sets
            </p>

            <p className="truncate text-xs text-(--tag-text)">
              {cardMuscleTags.length > 0
                ? cardMuscleTags.join(" · ")
                : "No muscle tags"}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-(--surface-border) bg-(--surface-control) text-(--text-soft) transition-transform duration-300",
            expanded && "rotate-180",
          )}
        >
          <ChevronDown size={16} />
        </span>
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          expanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-(--surface-border) px-4 pb-4 pt-4 sm:px-5">
            <Field
              label="Muscle tags"
              hint="Choose all muscles this exercise trains. Add a custom tag when needed."
            >
              <MuscleTagSelector
                availableTags={defaultMuscleTags}
                selectedTags={setupState.muscleTags}
                customTag={setupState.customTag}
                setCustomTag={(customTag) =>
                  setSetupState({ ...setupState, customTag })
                }
                onToggleTag={(tag) =>
                  setSetupState({
                    ...setupState,
                    muscleTags: toggleTag(setupState.muscleTags, tag),
                  })
                }
                onAddCustomTag={() => {
                  const normalizedTag = setupState.customTag.trim();

                  if (!normalizedTag) {
                    return;
                  }

                  const existingTag = defaultMuscleTags.find(
                    (tag) =>
                      tag.toLowerCase() === normalizedTag.toLowerCase(),
                  );

                  setSetupState({
                    ...setupState,
                    customTag: "",
                    muscleTags: addUniqueTag(
                      setupState.muscleTags,
                      existingTag ?? normalizedTag,
                    ),
                  });
                }}
              />
            </Field>

            <Field label="Tracking type">
              <SegmentedControl
                options={exerciseTypeOptions}
                value={setupState.exerciseType}
                onChange={(nextType) =>
                  setSetupState({
                    ...setupState,
                    exerciseType: nextType,
                    exerciseUnit: nextType === "reps" ? "kg" : "sec",
                  })
                }
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Unit" htmlFor={`unit-${exercise.id}`}>
                <SelectField
                  id={`unit-${exercise.id}`}
                  value={setupState.exerciseUnit}
                  onChange={(event) =>
                    setSetupState({
                      ...setupState,
                      exerciseUnit: event.target.value as ExerciseUnit,
                    })
                  }
                >
                  {displayUnits.map((unit) => (
                    <option
                      key={unit}
                      value={unit}
                      className="bg-slate-950 text-white"
                    >
                      {unit}
                    </option>
                  ))}
                </SelectField>
              </Field>

              <Field label="Starting sets" htmlFor={`sets-${exercise.id}`}>
                <TextField
                  id={`sets-${exercise.id}`}
                  type="number"
                  min="0"
                  max="12"
                  step="1"
                  inputMode="numeric"
                  value={setupState.plannedSetCount}
                  onChange={(event) =>
                    setSetupState({
                      ...setupState,
                      plannedSetCount: event.target.value,
                    })
                  }
                />
              </Field>
            </div>

            <Button
              tone="primary"
              fullWidth
              leadingIcon={<Check size={16} />}
              onClick={onSave}
            >
              Add to workout
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function MuscleTagPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-(--tag-border) bg-(--tag-bg) px-2.5 py-1 text-xs font-medium text-(--tag-text)">
      <span className="h-1.5 w-1.5 rounded-full bg-(--success)" />
      {children}
    </span>
  );
}

interface MuscleTagSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  customTag: string;
  setCustomTag: (customTag: string) => void;
  onToggleTag: (tag: string) => void;
  onAddCustomTag: () => void;
}

function MuscleTagSelector({
  availableTags,
  selectedTags,
  customTag,
  setCustomTag,
  onToggleTag,
  onAddCustomTag,
}: MuscleTagSelectorProps) {
  const normalizedSearch = customTag.trim().toLowerCase();
  const visibleTags = availableTags.filter((tag) =>
    tag.toLowerCase().includes(normalizedSearch),
  );

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <TextField
          aria-label="Search or add muscle tag"
          placeholder="Search or add muscle tag"
          value={customTag}
          onChange={(event) => setCustomTag(event.target.value)}
        />
        <Button
          tone="secondary"
          leadingIcon={<Plus size={16} />}
          onClick={onAddCustomTag}
          disabled={!customTag.trim()}
        >
          Add tag
        </Button>
      </div>

      {visibleTags.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-(--surface-border) p-3 text-sm text-(--text-muted)">
          No default tag matches. Add it as a custom tag.
        </p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-gutter-stable">
          {visibleTags.map((tag) => {
            const selected = selectedTags.includes(tag);

            return (
              <button
                key={tag}
                type="button"
                aria-pressed={selected}
                onClick={() => onToggleTag(tag)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200",
                  selected
                    ? "border-transparent bg-(--accent) text-(--accent-ink)"
                    : "border-(--surface-border) bg-(--surface-control) text-(--text-soft) hover:border-(--surface-border-strong) hover:bg-(--surface-control-hover)",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {selectedTags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-gutter-stable">
          {selectedTags.map((tag) => (
            <MuscleTagPill key={tag}>{tag}</MuscleTagPill>
          ))}
        </div>
      )}
    </div>
  );
}
