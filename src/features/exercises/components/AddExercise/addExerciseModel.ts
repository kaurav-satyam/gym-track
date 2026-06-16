import type {
  ExerciseLibraryItem,
} from "../../../../app/db/models/exercise-library.model";
import {
  EXERCISE_TYPES,
  type ExerciseType,
  type ExerciseUnit,
} from "../../../../app/db/models/exercise.model";

export interface ExerciseSetupState {
  exerciseType: ExerciseType;
  exerciseUnit: ExerciseUnit;
  plannedSetCount: string;
  muscleTags: string[];
  customTag: string;
}

export const ALL_FILTER_VALUE = "all" as const;
export const RESULT_STEP = 50;

export type AllFilter = typeof ALL_FILTER_VALUE;
export type ExerciseTypeFilter = ExerciseType | AllFilter;

export const defaultSetupState: ExerciseSetupState = {
  exerciseType: "reps",
  exerciseUnit: "kg",
  plannedSetCount: "3",
  muscleTags: [],
  customTag: "",
};

export const exerciseTypeOptions = EXERCISE_TYPES.map((value) => ({
  label: value,
  value,
}));

export const exerciseTypeFilterOptions: Array<{
  label: string;
  value: ExerciseTypeFilter;
}> = [
  { label: "All", value: ALL_FILTER_VALUE },
  ...EXERCISE_TYPES.map((value) => ({ label: value, value })),
];

export function createMuscleFilterOptions(tags: string[]) {
  return [ALL_FILTER_VALUE, ...tags, "Other"].filter(
    (tag, index, options) => options.indexOf(tag) === index,
  );
}

export function getMuscleOptionLabel(option: string) {
  return option === ALL_FILTER_VALUE ? "All muscle groups" : option;
}

export function toggleTag(tags: string[], tag: string) {
  return tags.includes(tag)
    ? tags.filter((currentTag) => currentTag !== tag)
    : [...tags, tag];
}

export function addUniqueTag(tags: string[], tag: string) {
  return tags.some(
    (currentTag) => currentTag.toLowerCase() === tag.toLowerCase(),
  )
    ? tags
    : [...tags, tag];
}

export function buildSetupState(
  exercise: ExerciseLibraryItem,
): ExerciseSetupState {
  return {
    exerciseType: exercise.exerciseType,
    exerciseUnit: exercise.exerciseUnit,
    plannedSetCount: "3",
    muscleTags: exercise.muscleTags ?? [],
    customTag: "",
  };
}
