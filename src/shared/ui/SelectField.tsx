import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "./cn";

interface ISelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export default function SelectField({
  children,
  className,
  ...props
}: ISelectFieldProps) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-(--surface-border) bg-white/4 px-4 py-3 text-sm text-(--text-strong) outline-none transition focus:border-(--surface-border-strong) focus:bg-white/[0.07]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
