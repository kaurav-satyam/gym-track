import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Eye,
  Timer,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import type { ExerciseTemplate } from "../../../../app/db/models/exercise.model";
import { IconButton, cn } from "../../../../shared/ui";

interface IExerciseCardHeaderProps {
  exercise: ExerciseTemplate;
  expanded: boolean;
  onToggle: () => void;
  totalSets: number;
  completedSetCount: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export default function ExerciseCardHeader({
  exercise,
  expanded,
  onToggle,
  totalSets,
  completedSetCount,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDelete,
}: IExerciseCardHeaderProps) {
  const navigate = useNavigate();
  const expandLabel = `${expanded ? "Collapse" : "Expand"} ${exercise.title}`;
  const isRepsExercise = exercise.exerciseType === "reps";

  return (
    <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
      <div className="w-18 shrink-0 sm:w-19">
        <div
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-[1.35rem] border px-3 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
            isRepsExercise
              ? "border-sky-400/25 bg-sky-400/10 text-sky-100"
              : "border-amber-400/25 bg-amber-400/10 text-amber-100",
          )}
        >
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-2xl border bg-black/15",
              isRepsExercise
                ? "border-sky-300/20 text-sky-50"
                : "border-amber-300/20 text-amber-50",
            )}
          >
            {isRepsExercise ? <Dumbbell size={18} /> : <Timer size={18} />}
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
            {exercise.exerciseType}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <h2 className="truncate text-base font-semibold text-(--text-strong)">
          {exercise.title}
        </h2>

        <div className="space-y-2">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
              Config
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <ConfigChip>{exercise.exerciseType}</ConfigChip>
              <ConfigChip>{exercise.exerciseUnit}</ConfigChip>
              <ConfigChip>
                {completedSetCount}/{totalSets} sets
              </ConfigChip>
            </div>
          </div>

          {exercise.muscleTags && exercise.muscleTags.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
                Muscle tags
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-gutter:stable]">
                {exercise.muscleTags.map((tag) => (
                  <MuscleTagPill key={tag}>{tag}</MuscleTagPill>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <IconButton
              tone="ghost"
              size="sm"
              className="h-9 w-9 rounded-xl"
              aria-label={`View history for ${exercise.title}`}
              title="View history"
              onClick={() => navigate(`/exercises/${exercise.id}/history`)}
            >
              <Eye size={14} />
            </IconButton>

            <IconButton
              tone="danger"
              size="sm"
              className="h-9 w-9 rounded-xl"
              aria-label={"Delete " + exercise.title}
              title="Delete exercise"
              onClick={onDelete}
            >
              <Trash2 size={14} />
            </IconButton>

            <div className="inline-flex items-center rounded-xl border border-(--surface-border) bg-white/3">
              <IconButton
                tone="ghost"
                size="sm"
                className="h-8 w-8 rounded-lg border-transparent"
                aria-label={`Move ${exercise.title} up`}
                title="Move up"
                disabled={!canMoveUp}
                onClick={onMoveUp}
              >
                <ArrowUp size={14} />
              </IconButton>

              <div className="h-5 w-px bg-(--surface-border)" />

              <IconButton
                tone="ghost"
                size="sm"
                className="h-8 w-8 rounded-lg border-transparent"
                aria-label={`Move ${exercise.title} down`}
                title="Move down"
                disabled={!canMoveDown}
                onClick={onMoveDown}
              >
                <ArrowDown size={14} />
              </IconButton>
            </div>
          </div>

          <IconButton
            tone="secondary"
            size="sm"
            className="h-9 w-9 rounded-xl"
            aria-label={expandLabel}
            title={expandLabel}
            onClick={onToggle}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function ConfigChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-(--surface-border) bg-black/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-soft)">
      {children}
    </span>
  );
}

function MuscleTagPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-100">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
      {children}
    </span>
  );
}
