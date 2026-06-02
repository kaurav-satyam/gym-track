import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

type TCompactNumberInputProps = InputHTMLAttributes<HTMLInputElement>;

export default function CompactNumberInput({
  className,
  ...props
}: TCompactNumberInputProps) {
  return (
    <input
      className={cn(
        "h-10 min-w-0 rounded-xl border border-(--surface-border) bg-black/20 px-3 text-sm text-(--text-strong) outline-none transition placeholder:text-(--text-muted) focus:border-(--surface-border-strong)",
        className,
      )}
      {...props}
    />
  );
}
