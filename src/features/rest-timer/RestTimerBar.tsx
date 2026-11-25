import { Timer, X } from "lucide-react";
import { useEffect, useState } from "react";
import { addRestTime, stopRestTimer, useRestTimer } from "./restTimer";

/** Floating countdown shown above the navigation while resting. */
export default function RestTimerBar() {
  const timer = useRestTimer();
  const now = useNow(timer?.status === "running");

  if (!timer) {
    return null;
  }

  if (timer.status === "done") {
    return (
      <div
        role="status"
        className="motion-surface flex w-full items-center gap-3 rounded-2xl bg-(--accent) px-4 py-3 text-(--accent-ink) shadow-(--shadow-panel)"
      >
        <Timer size={20} />
        <p className="flex-1 text-sm font-bold">Rest over. Next set!</p>
        <button type="button" aria-label="Dismiss" className="rounded-full p-1" onClick={stopRestTimer}>
          <X size={18} />
        </button>
      </div>
    );
  }

  const remainingMs = Math.max(0, timer.endsAt - now);
  const progress = 1 - remainingMs / timer.totalMs;

  return (
    <div
      role="timer"
      aria-label="Rest timer"
      className="motion-surface relative w-full overflow-hidden rounded-2xl border border-(--surface-card-border) bg-(--surface-card) shadow-(--shadow-panel)"
    >
      <div className="flex items-center gap-3 py-2 pl-4 pr-2">
        <Timer size={20} className="shrink-0 text-(--accent)" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-muted)">Rest</p>
          <p className="text-xl font-bold leading-tight tabular-nums text-(--text-strong)">
            {formatClock(remainingMs)}
          </p>
        </div>
        <button
          type="button"
          className="min-h-10 rounded-full bg-(--surface-control) px-4 text-sm font-semibold text-(--text-strong) transition active:scale-95"
          onClick={() => addRestTime(30)}
        >
          +30s
        </button>
        <button
          type="button"
          className="min-h-10 rounded-full px-3 text-sm font-semibold text-(--text-muted) transition active:scale-95"
          onClick={stopRestTimer}
        >
          Skip
        </button>
      </div>
      <div className="h-1 bg-(--surface-control)">
        <div
          className="h-full bg-(--accent) transition-[width] duration-300 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

/** Current time, re-rendering every 250ms while `active`. */
function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) {
      return;
    }

    const interval = setInterval(() => setNow(Date.now()), 250);

    return () => clearInterval(interval);
  }, [active]);

  return now;
}

function formatClock(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
