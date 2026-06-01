import type { ReactNode } from "react";
import Panel from "./Panel";
import { cn } from "./cn";

interface IEmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  action,
  className,
}: IEmptyStateProps) {
  return (
    <Panel className={cn("p-8 text-center sm:p-10", className)}>
      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-xl font-semibold">{title}</h2>

        {description && (
          <p className="text-sm leading-6 text-(--text-muted)">{description}</p>
        )}

        {action && <div className="pt-2">{action}</div>}
      </div>
    </Panel>
  );
}
