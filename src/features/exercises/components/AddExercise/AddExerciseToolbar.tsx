import { ArrowLeft, Search } from "lucide-react";
import { IconButton, TextField } from "../../../../shared/ui";
import type { ExerciseTypeFilter } from "./addExerciseModel";
import SearchableMuscleGroupSelect from "./SearchableMuscleGroupSelect";
import TypeFilterSelect from "./TypeFilterSelect";

interface AddExerciseToolbarProps {
  searchQuery: string;
  categoryFilter: string;
  categoryFilterOptions: string[];
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
        <SearchableMuscleGroupSelect
          id="exercise-category-filter"
          options={categoryFilterOptions}
          value={categoryFilter}
          onChange={onCategoryFilterChange}
        />
        <TypeFilterSelect
          value={exerciseTypeFilter}
          onChange={onExerciseTypeFilterChange}
        />
      </div>
    </div>
  );
}
