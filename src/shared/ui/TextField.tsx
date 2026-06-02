import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

type TTextFieldProps = InputHTMLAttributes<HTMLInputElement>;

export default function TextField({ className, ...props }: TTextFieldProps) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-(--surface-border) bg-white/4 px-4 py-3 text-sm text-(--text-strong) outline-none transition placeholder:text-(--text-muted) focus:border-(--surface-border-strong) focus:bg-white/[0.07]",
        className,
      )}
      {...props}
    />
  );
}
