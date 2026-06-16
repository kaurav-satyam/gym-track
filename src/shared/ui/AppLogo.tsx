import { cn } from "./cn";

type TAppLogoSize = "sm" | "md" | "lg";

interface IAppLogoProps {
  className?: string;
  imageClassName?: string;
  size?: TAppLogoSize;
}

const sizeClasses: Record<TAppLogoSize, string> = {
  sm: "h-9 w-9 rounded-xl",
  md: "h-11 w-11 rounded-2xl",
  lg: "h-13 w-13 rounded-[18px]",
};

export default function AppLogo({
  className,
  imageClassName,
  size = "md",
}: IAppLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden border border-(--surface-border) bg-(--app-bg) shadow-[var(--shadow-row)]",
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
    >
      <img
        src="/logo.svg"
        alt=""
        className={cn("h-full w-full object-cover", imageClassName)}
        draggable="false"
      />
    </span>
  );
}
