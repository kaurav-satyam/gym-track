import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type TButtonTone = "primary" | "secondary" | "ghost" | "danger";
type TButtonSize = "md" | "lg";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  tone?: TButtonTone;
  size?: TButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
}

export default function Button({
  children,
  className,
  tone = "secondary",
  size = "md",
  fullWidth = false,
  leadingIcon,
  type,
  ...props
}: IButtonProps) {
  const toneClasses = {
    primary: "border-transparent bg-(--accent) text-(--accent-ink) hover:opacity-90",
    secondary:
      "border-(--surface-border) bg-white/[0.04] text-(--text-strong) hover:border-(--surface-border-strong) hover:bg-white/[0.08]",
    ghost:
      "border-dashed border-(--surface-border) bg-transparent text-(--text-soft) hover:border-(--surface-border-strong) hover:bg-white/[0.04]",
    danger: "border-transparent bg-(--danger) text-white hover:opacity-90",
  };

  const sizeClasses = {
    md: "min-h-11 rounded-2xl px-4 py-2.5 text-sm",
    lg: "min-h-12 rounded-2xl px-5 py-3 text-sm",
  };

  return (
    <button
      type={type ?? "button"}
      className={cn(
        "inline-flex items-center justify-center gap-2 border font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:pointer-events-none disabled:opacity-50",
        toneClasses[tone],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {leadingIcon}
      {children}
    </button>
  );
}
