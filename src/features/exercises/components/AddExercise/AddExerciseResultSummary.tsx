import type { ReactNode } from "react";
import { X } from "lucide-react";
import {
  ALL_FILTER_VALUE,
  getMuscleOptionLabel,
  type ExerciseTypeFilter,
} from "./addExerciseModel";

interface AddExerciseResultSummaryProps {
  resultSummary: string;
  categoryFilter: string;
  exerciseTypeFilter: ExerciseTypeFilter;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export default function AddExerciseResultSummary({
  resultSummary,
  categoryFilter,
  exerciseTypeFilter,
  hasActiveFilters,
  onClearFilters,
}: AddExerciseResultSummaryProps) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-2 rounded-xl border border-(--surface-border) bg-(--surface-control) px-3 py-1.5 text-xs text-(--text-soft)">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="font-medium text-(--text-strong)">
          {resultSummary}
        </span>
        {categoryFilter !== ALL_FILTER_VALUE && (
          <FilterPill>{getMuscleOptionLabel(categoryFilter)}</FilterPill>
        )}
        {exerciseTypeFilter !== ALL_FILTER_VALUE && (
          <FilterPill>{exerciseTypeFilter}</FilterPill>
        )}
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-(--text-soft) transition hover:text-(--text-strong)"
          onClick={onClearFilters}
        >
          <X size={13} />
          Clear
        </button>
      )}
    </div>
  );
}

function FilterPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-(--accent-border) bg-(--accent-soft) px-2 py-0.5 text-[11px] font-medium capitalize text-(--text-strong)">
      {children}
    </span>
  );
}
