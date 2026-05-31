interface IWeekdayCardProps {
  readonly day: string;
  readonly workoutType?: string;
  readonly exerciseCount?: number;
  readonly duration?: number;
  readonly muscleGroups?: string[];
  readonly progress?: number;
  readonly isRestDay?: boolean;

  readonly onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function WeekdayCard({
  day,
  workoutType,
  exerciseCount = 0,
  duration,
  muscleGroups = [],
  progress = 0,
  onClick,
}: IWeekdayCardProps) {
  return (
    <div
      data-day={day}
      onClick={onClick}
      className="
        rounded-3xl
        bg-zinc-950
        border
        border-zinc-800
        p-4
        space-y-4
        active:scale-[0.98]
        transition-transform
      "
    >
      {/* Top */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{day}</h2>

          <p className="text-zinc-400 text-sm">{muscleGroups.join(" • ")}</p>
        </div>

        <span
          className="
            px-3
            py-1
            rounded-full
            bg-white
            text-black
            text-xs
            font-medium
          "
        >
          {workoutType}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex flex-col">
          <span className="text-zinc-500">Exercises</span>

          <span className="text-white font-medium">{exerciseCount}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-zinc-500">Duration</span>

          <span className="text-white font-medium">{duration}m</span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">Progress</span>

          <span className="text-zinc-400">{progress}%</span>
        </div>

        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-white rounded-full"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
