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
        "inline-grid gap-1 rounded-xl bg-(--surface-control) p-1",
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
              "min-h-9 min-w-14 rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
              isActive
                ? "bg-(--accent) font-medium text-(--accent-ink)"
                : "text-(--text-soft) hover:text-(--text-strong)",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
