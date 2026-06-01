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
        "grid gap-2 rounded-[22px] border border-(--surface-border) bg-black/10 p-1.5",
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
              "rounded-2xl px-4 py-3 text-sm font-medium capitalize transition duration-200",
              isActive
                ? "bg-(--accent) text-(--accent-ink)"
                : "text-(--text-soft) hover:bg-white/5",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
