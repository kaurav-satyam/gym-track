import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from "react";
import { cn } from "./cn";

type TRowCardProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export default function RowCard<T extends ElementType = "div">({
  as,
  children,
  className,
  ...props
}: TRowCardProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "motion-surface rounded-2xl border border-(--surface-border) bg-(--surface-row) shadow-[var(--shadow-row)]",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
