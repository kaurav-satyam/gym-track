import { cn } from "./cn";

interface ISegmentedOption<T extends string> {
  label: string;
  value: T;
}

interface ISegmentedControlProps<T extends string> {
  options: readonly ISegmentedOption<T>[];
  value: T;
  onChange: (nextValue: T) => void;
  className?: string;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: ISegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "grid gap-1.5 rounded-[22px] border border-(--surface-border) bg-(--surface-inset) p-1.5",
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-10 rounded-2xl px-3 py-2 text-sm font-medium capitalize transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
              isActive
                ? "bg-(--accent) text-(--accent-ink) shadow-[var(--shadow-row)]"
                : "text-(--text-soft) hover:bg-(--surface-control-hover) hover:text-(--text-strong)",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
