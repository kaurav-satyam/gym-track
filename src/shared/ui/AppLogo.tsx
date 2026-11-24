import { cn } from "./cn";

type TAppLogoSize = "md" | "lg";

interface IAppLogoProps {
  className?: string;
  size?: TAppLogoSize;
}

const sizeClasses: Record<TAppLogoSize, string> = {
  md: "h-11 w-11 rounded-2xl",
  lg: "h-13 w-13 rounded-[18px]",
};

export default function AppLogo({
  className,
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
        className="h-full w-full object-cover"
        draggable="false"
      />
    </span>
  );
}
