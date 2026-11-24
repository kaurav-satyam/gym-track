import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

/** Small square, outlined icon button. Always pass an `aria-label`. */
export default function IconButton({
  className,
  type,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type ?? "button"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center border transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50",
        "border-(--surface-border) bg-transparent text-(--text-soft) hover:border-(--surface-border-strong) hover:bg-(--surface-control)",
        "h-9 w-9 rounded-xl",
        className,
      )}
      {...props}
    />
  );
}
