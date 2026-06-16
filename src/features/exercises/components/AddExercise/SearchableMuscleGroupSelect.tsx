import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { TextField, cn } from "../../../../shared/ui";
import { getMuscleOptionLabel } from "./addExerciseModel";

interface SearchableMuscleGroupSelectProps {
  id: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function SearchableMuscleGroupSelect({
  id,
  options,
  value,
  onChange,
}: SearchableMuscleGroupSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedLabel = getMuscleOptionLabel(value);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = options.filter((option) =>
    getMuscleOptionLabel(option).toLowerCase().includes(normalizedQuery),
  );

  function selectOption(nextValue: string) {
    onChange(nextValue);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <TextField
          id={id}
          aria-expanded={open}
          aria-haspopup="listbox"
          autoComplete="off"
          className="h-10 rounded-xl py-2 pr-9 text-xs font-medium"
          placeholder={selectedLabel}
          value={open ? query : selectedLabel}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
        />
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) transition-transform duration-200",
            open && "rotate-180",
          )}
          size={17}
        />
      </div>

      {open && (
        <div
          className="max-h-64 overflow-auto rounded-xl border border-(--surface-border) bg-(--surface-panel) p-1 shadow-[var(--shadow-row)] scrollbar-gutter-stable"
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <p className="px-3 py-2 text-sm text-(--text-muted)">
              No muscle group found.
            </p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-(--surface-control-hover)",
                  option === value
                    ? "bg-(--surface-active) font-medium text-(--text-strong)"
                    : "text-(--text-soft)",
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
                role="option"
                aria-selected={option === value}
              >
                {getMuscleOptionLabel(option)}
                {option === value && <Check size={14} />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
