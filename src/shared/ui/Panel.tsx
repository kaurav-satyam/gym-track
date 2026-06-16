import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "./cn";

type TPanelProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  interactive?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export default function Panel<T extends ElementType = "div">({
  as,
  children,
  className,
  interactive = false,
  ...props
}: TPanelProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "motion-surface rounded-[26px] border border-(--surface-border) bg-(--surface-panel) shadow-[var(--shadow-panel)] backdrop-blur-xl",
        interactive &&
          "transition duration-200 hover:-translate-y-0.5 hover:border-(--surface-border-strong) hover:bg-(--surface-control-hover) active:translate-y-0 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
