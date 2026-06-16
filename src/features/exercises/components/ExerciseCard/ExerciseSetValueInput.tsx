import type { InputHTMLAttributes } from "react";
import { cn } from "../../../../shared/ui";

interface IExerciseSetValueInputProps extends InputHTMLAttributes<HTMLInputElement> {
  suffix: string;
}

export default function ExerciseSetValueInput({
  suffix,
  className,
  ...props
}: IExerciseSetValueInputProps) {
  return (
    <div className="flex min-w-0 items-center overflow-hidden rounded-xl border border-(--surface-border) bg-(--surface-inset) transition focus-within:border-(--surface-border-strong)">
      <input
        className={cn(
          "h-11 min-w-0 flex-1 bg-transparent px-3 text-center text-sm font-medium text-(--text-strong) outline-none placeholder:text-(--text-muted) [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          className,
        )}
        inputMode="decimal"
        {...props}
      />
      <span className="flex h-11 shrink-0 items-center border-l border-(--surface-border) bg-(--surface-control) px-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-(--text-muted)">
        {suffix}
      </span>
    </div>
  );
}
