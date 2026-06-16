import type { ReactNode } from "react";
import { cn } from "./cn";

type TBadgeTone = "solid" | "soft";

interface IBadgeProps {
  children: ReactNode;
  tone?: TBadgeTone;
  className?: string;
}

export default function Badge({
  children,
  tone = "solid",
  className,
}: IBadgeProps) {
  const toneClasses = {
    solid: "bg-(--accent) text-(--accent-ink) border-transparent",
    soft: "border-(--surface-border) bg-(--surface-control) text-(--text-soft)",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
