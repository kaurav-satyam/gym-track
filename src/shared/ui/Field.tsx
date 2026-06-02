import type { ReactNode } from "react";
import { cn } from "./cn";

interface IFieldProps {
  children: ReactNode;
  label: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
}

export default function Field({
  children,
  label,
  htmlFor,
  hint,
  className,
}: IFieldProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="space-y-1">
        <label htmlFor={htmlFor} className="text-sm font-medium text-(--text-soft)">
          {label}
        </label>

        {hint && <p className="text-xs text-(--text-muted)">{hint}</p>}
      </div>

      {children}
    </div>
  );
}
