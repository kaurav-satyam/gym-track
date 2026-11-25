import type { ReactNode } from "react";

interface IScreenHeaderProps {
  title: string;
  /** Small uppercase line above the title. */
  eyebrow?: string;
  /** Right-aligned control, e.g. an "Edit" button. */
  action?: ReactNode;
}

/** Large title used at the top of every tab screen. */
export default function ScreenHeader({ title, eyebrow, action }: IScreenHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-(--text-muted)">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 truncate text-[2rem] font-bold leading-none tracking-tight text-(--text-strong)">
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}
