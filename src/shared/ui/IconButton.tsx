import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type TIconButtonTone = "primary" | "secondary" | "success" | "danger" | "ghost";
type TIconButtonSize = "sm" | "md";

interface IIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: TIconButtonTone;
  size?: TIconButtonSize;
}

export default function IconButton({
  className,
  tone = "secondary",
  size = "md",
  type,
  ...props
}: IIconButtonProps) {
  const toneClasses = {
    primary: "border-transparent bg-(--accent) text-(--accent-ink) hover:opacity-90",
    secondary:
      "border-(--surface-border) bg-white/[0.04] text-(--text-soft) hover:border-(--surface-border-strong) hover:bg-white/[0.08]",
    success: "border-transparent bg-(--success) text-white hover:opacity-90",
    danger: "border-transparent bg-(--danger) text-white hover:opacity-90",
    ghost:
      "border-(--surface-border) bg-transparent text-(--text-soft) hover:border-(--surface-border-strong) hover:bg-white/[0.04]",
  };

  const sizeClasses = {
    sm: "h-9 w-9 rounded-xl",
    md: "h-10 w-10 rounded-2xl",
  };

  return (
    <button
      type={type ?? "button"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center border transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:pointer-events-none disabled:opacity-50",
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
