import { ArrowLeft, Search } from "lucide-react";
import {
  IconButton,
  SearchableSelect,
  type SearchableSelectOption,
  TextField,
} from "../../../../shared/ui";
import {
  exerciseTypeFilterSelectOptions,
  type ExerciseTypeFilter,
} from "./addExerciseModel";

interface AddExerciseToolbarProps {
  searchQuery: string;
  categoryFilter: string;
  categoryFilterOptions: SearchableSelectOption[];
  exerciseTypeFilter: ExerciseTypeFilter;
  onBack: () => void;
  onSearchQueryChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onExerciseTypeFilterChange: (value: ExerciseTypeFilter) => void;
}

export default function AddExerciseToolbar({
  searchQuery,
  categoryFilter,
  categoryFilterOptions,
  exerciseTypeFilter,
  onBack,
  onSearchQueryChange,
  onCategoryFilterChange,
  onExerciseTypeFilterChange,
}: AddExerciseToolbarProps) {
  return (
    <div className="sticky top-0 z-30 -mx-4 border-b border-(--surface-border) bg-(--app-bg-start)/95 px-4 pb-2 pt-1.5 backdrop-blur-xl sm:top-3 sm:mx-0 sm:rounded-[26px] sm:border sm:bg-(--surface-panel) sm:p-2.5 sm:shadow-(--shadow-panel)">
      <div className="flex items-center gap-2">
        <IconButton
          tone="secondary"
          size="sm"
          aria-label="Back to workout day"
          title="Back"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
        </IconButton>

        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)"
            size={18}
          />
          <TextField
            aria-label="Search exercises"
            className="h-10 rounded-xl py-2 pl-10 text-sm"
            placeholder="Search exercise"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
          />
        </div>
      </div>

      <div className="mt-1.5 grid grid-cols-2 gap-2">
        <SearchableSelect
          id="exercise-category-filter"
          ariaLabel="Muscle group filter"
          searchPlaceholder="Search muscle group"
          emptyText="No muscle group found."
          options={categoryFilterOptions}
          value={categoryFilter}
          onChange={onCategoryFilterChange}
        />
        <SearchableSelect
          id="exercise-type-filter"
          ariaLabel="Exercise type filter"
          searchPlaceholder="Search type"
          emptyText="No type found."
          options={exerciseTypeFilterSelectOptions}
          value={exerciseTypeFilter}
          onChange={(value) =>
            onExerciseTypeFilterChange(value as ExerciseTypeFilter)
          }
        />
      </div>
    </div>
  );
}
