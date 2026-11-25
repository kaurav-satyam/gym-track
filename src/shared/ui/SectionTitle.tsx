import type { ReactNode } from "react";

/** Small uppercase label above a group of content. */
export default function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between px-1">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-(--text-muted)">
        {children}
      </h2>
      {action}
    </div>
  );
}
