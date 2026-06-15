export const DEFAULT_MUSCLE_TAGS = [
  "Chest",
  "Back",
  "Shoulders",
  "Legs",
  "Biceps",
  "Triceps",
  "Core",
  "Cardio",
  "Full Body",
] as const;

export type DefaultMuscleTag = (typeof DEFAULT_MUSCLE_TAGS)[number];
