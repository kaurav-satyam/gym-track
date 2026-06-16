import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

export default function TextField({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-(--surface-border) bg-(--surface-control) px-4 py-3 text-sm text-(--text-strong) outline-none transition duration-200 placeholder:text-(--text-muted) hover:border-(--surface-border-strong) focus:-translate-y-0.5 focus:border-(--surface-border-strong) focus:bg-(--surface-control-hover) focus:shadow-[var(--shadow-row)]",
        className,
      )}
      {...props}
    />
  );
}
