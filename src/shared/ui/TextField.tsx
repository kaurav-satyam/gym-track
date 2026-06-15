import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

type TTextFieldProps = InputHTMLAttributes<HTMLInputElement>;

export default function TextField({ className, ...props }: TTextFieldProps) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-(--surface-border) bg-white/4 px-4 py-3 text-sm text-(--text-strong) outline-none transition duration-200 placeholder:text-(--text-muted) hover:border-(--surface-border-strong) focus:-translate-y-0.5 focus:border-(--surface-border-strong) focus:bg-white/[0.07] focus:shadow-[0_12px_28px_rgba(2,6,23,0.16)]",
        className,
      )}
      {...props}
    />
  );
}
