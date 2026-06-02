import { Trash2 } from "lucide-react";
import { IconButton, cn } from "../../../../shared/ui";

interface IExerciseSetCardHeaderProps {
  setNumber: number;
  previousValue: string;
  completedToday: boolean;
  onDelete: () => void;
}

export default function ExerciseSetCardHeader({
  setNumber,
  previousValue,
  completedToday,
  onDelete,
}: IExerciseSetCardHeaderProps) {
  const hasPreviousValue = previousValue !== "--";

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex items-center gap-3">
        <div
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.08em]",
            completedToday
              ? "border-emerald-400/35 bg-emerald-500/12 text-emerald-100"
              : "border-(--surface-border) bg-black/20 text-(--text-strong)",
          )}
        >
          Set {setNumber}
        </div>

        <p className="truncate text-sm text-(--text-muted)">
          Previous{" "}
          <span
            className={cn(
              "font-medium",
              hasPreviousValue ? "text-(--text-soft)" : "text-(--text-muted)",
            )}
          >
            {previousValue}
          </span>
        </p>
      </div>

      <IconButton
        tone="ghost"
        size="sm"
        className="h-9 w-9 rounded-xl"
        aria-label={`Delete set ${setNumber}`}
        onClick={onDelete}
      >
        <Trash2 size={14} />
      </IconButton>
    </div>
  );
}
