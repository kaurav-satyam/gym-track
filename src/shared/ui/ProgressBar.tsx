interface IProgressBarProps {
  value: number;
  label?: string;
}

export default function ProgressBar({
  value,
  label = "Progress",
}: IProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-(--text-muted)">{label}</span>
        <span className="font-medium text-(--text-soft)">{safeValue}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-(--accent) transition-[width] duration-500 ease-out"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
