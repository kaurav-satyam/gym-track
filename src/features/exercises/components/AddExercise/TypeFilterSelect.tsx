import { SelectField } from "../../../../shared/ui";
import {
  exerciseTypeFilterOptions,
  type ExerciseTypeFilter,
} from "./addExerciseModel";

interface TypeFilterSelectProps {
  value: ExerciseTypeFilter;
  onChange: (value: ExerciseTypeFilter) => void;
}

export default function TypeFilterSelect({
  value,
  onChange,
}: TypeFilterSelectProps) {
  return (
    <div className="relative">
      <SelectField
        aria-label="Exercise type filter"
        className="h-10 rounded-xl py-2 pl-3 pr-8 text-xs font-medium capitalize"
        value={value}
        onChange={(event) => onChange(event.target.value as ExerciseTypeFilter)}
      >
        {exerciseTypeFilterOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-slate-950 text-white"
          >
            {option.label === "All" ? "All types" : option.label}
          </option>
        ))}
      </SelectField>
    </div>
  );
}
