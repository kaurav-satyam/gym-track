import type { SelectHTMLAttributes } from "react";
import { cn } from "./cn";

export default function SelectField({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-(--surface-border) bg-(--surface-control) px-4 py-3 text-sm text-(--text-strong) outline-none transition duration-200 hover:border-(--surface-border-strong) focus:-translate-y-0.5 focus:border-(--surface-border-strong) focus:bg-(--surface-control-hover) focus:shadow-[var(--shadow-row)]",
        className,
      )}
      {...props}
    />
  );
}
