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
        "motion-surface rounded-[28px] border border-(--surface-border) bg-(--surface-panel) shadow-[0_20px_60px_rgba(3,7,18,0.32)] backdrop-blur-xl",
        interactive &&
          "transition duration-200 hover:-translate-y-0.5 hover:border-(--surface-border-strong) hover:bg-white/4 active:translate-y-0 active:scale-[0.995]",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
