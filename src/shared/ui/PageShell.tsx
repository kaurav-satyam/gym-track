import type { ReactNode } from "react";
import { cn } from "./cn";

interface IPageShellProps {
  children: ReactNode;
  title?: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function PageShell({
  children,
  title,
  eyebrow,
  description,
  actions,
  className,
  contentClassName,
}: IPageShellProps) {
  return (
    <section className={cn("mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-8", className)}>
      {(title || eyebrow || description || actions) && (
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            {eyebrow && (
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-(--text-muted)">
                {eyebrow}
              </p>
            )}

            {title && <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>}

            {description && (
              <p className="max-w-2xl text-sm leading-6 text-(--text-muted)">
                {description}
              </p>
            )}
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}

      <div className={cn("space-y-4 sm:space-y-5", contentClassName)}>{children}</div>
    </section>
  );
}
