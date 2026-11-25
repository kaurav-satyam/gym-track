import type { HTMLAttributes } from "react";
import { cn } from "./cn";

/** The app's standard content surface: solid, softly bordered and raised. */
export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-(--surface-card-border) bg-(--surface-card) shadow-(--shadow-card)",
        className,
      )}
      {...props}
    />
  );
}
