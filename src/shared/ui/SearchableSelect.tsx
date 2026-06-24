import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import TextField from "./TextField";
import { cn } from "./cn";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  /** Selectable options rendered in the popover. */
  options: SearchableSelectOption[];
  /** Currently selected value. */
  value: string;
  /** Called with the next value when an option is chosen. */
  onChange: (value: string) => void;
  /** Optional id wired to the underlying input (for label association). */
  id?: string;
  /** Accessible label for the trigger input. */
  ariaLabel?: string;
  /** Placeholder shown in the search field while filtering. */
  searchPlaceholder?: string;
  /** Message shown when no option matches the current query. */
  emptyText?: string;
}

/**
 * Searchable single-select dropdown with a styled popover.
 *
 * Reusable across filters and forms — pass `{ value, label }` options and a
 * controlled `value`/`onChange` pair. Closes on selection, on outside blur,
 * and when the trigger is clicked again while open.
 */
export default function SearchableSelect({
  options,
  value,
  onChange,
  id,
  ariaLabel,
  searchPlaceholder = "Search",
  emptyText = "No match found.",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? "",
    [options, value],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(normalizedQuery),
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
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-haspopup="listbox"
          autoComplete="off"
          className="h-10 rounded-xl py-2 pr-9 text-xs font-medium"
          placeholder={selectedLabel || searchPlaceholder}
          value={open ? query : selectedLabel}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onMouseDown={(event) => {
            // Toggle on click: if already open, close it (and drop focus so
            // onFocus doesn't immediately reopen).
            if (open) {
              event.preventDefault();
              setOpen(false);
              event.currentTarget.blur();
            }
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
          className="max-h-64 overflow-auto rounded-xl border border-(--surface-border) bg-(--surface-panel) p-1 shadow-(--shadow-row) scrollbar-gutter-stable"
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <p className="px-3 py-2 text-sm text-(--text-muted)">{emptyText}</p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-(--surface-control-hover)",
                  option.value === value
                    ? "bg-(--surface-active) font-medium text-(--text-strong)"
                    : "text-(--text-soft)",
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option.value);
                }}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
                {option.value === value && <Check size={14} />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
