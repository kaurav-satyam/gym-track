import type { HTMLAttributes } from "react";
import { cn } from "./cn";

/** Raised, rounded surface for floating content (e.g. the install prompt). */
export default function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "motion-surface rounded-[26px] border border-(--surface-border) bg-(--surface-panel) shadow-[var(--shadow-panel)] backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
