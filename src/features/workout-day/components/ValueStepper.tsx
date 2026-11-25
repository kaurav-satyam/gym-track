import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { formatNumber } from "@/domain/sets";

interface IValueStepperProps {
  label: string;
  unit: string;
  value?: number;
  step: number;
  onChange: (value: number | undefined) => void;
}

/** − [value] + control. The value is also typeable for big jumps. */
export default function ValueStepper({
  label,
  unit,
  value,
  step,
  onChange,
}: IValueStepperProps) {
  // Local draft so partially typed values like "42." aren't reset mid-typing.
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? (value == null ? "" : formatNumber(value));

  function nudge(direction: 1 | -1) {
    setDraft(null);
    const next = Math.max(0, (value ?? 0) + direction * step);

    onChange(Math.round(next * 100) / 100);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--surface-card) text-(--text-strong) shadow-(--shadow-card) transition active:scale-90 disabled:opacity-40"
        disabled={!value}
        onClick={() => nudge(-1)}
      >
        <Minus size={18} strokeWidth={2.5} />
      </button>

      <label className="flex h-12 min-w-0 flex-1 items-baseline justify-center gap-1 rounded-2xl border border-(--surface-card-border) bg-(--surface-card) px-3 focus-within:border-(--accent-border)">
        <input
          type="text"
          inputMode="decimal"
          aria-label={label}
          className="w-full min-w-0 self-center bg-transparent text-center text-xl font-bold tabular-nums text-(--text-strong) outline-none"
          value={display}
          placeholder="0"
          onFocus={(event) => event.target.select()}
          onChange={(event) => {
            const text = event.target.value.replace(",", ".");

            if (!/^\d*\.?\d*$/.test(text)) {
              return;
            }

            setDraft(text);
            onChange(text === "" || text === "." ? undefined : Number(text));
          }}
          onBlur={() => setDraft(null)}
        />
        <span className="shrink-0 self-center text-xs text-(--text-muted)">{unit}</span>
      </label>

      <button
        type="button"
        aria-label={`Increase ${label}`}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--surface-card) text-(--text-strong) shadow-(--shadow-card) transition active:scale-90"
        onClick={() => nudge(1)}
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
