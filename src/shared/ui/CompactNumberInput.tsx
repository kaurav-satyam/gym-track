import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

export default function CompactNumberInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 min-w-0 rounded-xl border border-(--surface-border) bg-(--surface-inset) px-3 text-sm text-(--text-strong) outline-none transition placeholder:text-(--text-muted) focus:border-(--surface-border-strong) focus:ring-2 focus:ring-[var(--focus-ring)]",
        className,
      )}
      {...props}
    />
  );
}
