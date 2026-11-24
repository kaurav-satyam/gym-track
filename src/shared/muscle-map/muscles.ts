/**
 * Muscle vocabulary for the body-map SVGs.
 *
 * Each group is one figure (chest, back, legs, ...). Every muscle id is
 * globally unique so a shape drawn in several views (e.g. delts on the front
 * and back torso) always refers to the same muscle.
 */
export const MUSCLE_GROUPS = {
  chest: ["upperChest", "midChest", "lowerChest", "innerChest"],
  shoulders: ["frontDelts", "sideDelts", "rearDelts"],
  back: ["traps", "rhomboids", "teres", "lats", "lowerBack"],
  arms: ["biceps", "triceps", "forearms"],
  core: ["upperAbs", "lowerAbs", "obliques", "serratus"],
  legs: ["hipFlexors", "quads", "adductors", "glutes", "hamstrings", "calves"],
  neck: ["neckFront", "neckBack"],
} as const satisfies Record<string, readonly string[]>;

export type MuscleGroup = keyof typeof MUSCLE_GROUPS;
export type MuscleOf<G extends MuscleGroup> = (typeof MUSCLE_GROUPS)[G][number];
export type MuscleId = MuscleOf<MuscleGroup>;

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  shoulders: "Shoulders",
  back: "Back",
  arms: "Arms",
  core: "Core",
  legs: "Legs",
  neck: "Neck",
};

export const MUSCLE_LABELS: Record<MuscleId, string> = {
  upperChest: "Upper chest",
  midChest: "Mid chest",
  lowerChest: "Lower chest",
  innerChest: "Inner chest",
  frontDelts: "Front delts",
  sideDelts: "Side delts",
  rearDelts: "Rear delts",
  traps: "Traps",
  rhomboids: "Rhomboids",
  teres: "Teres & infraspinatus",
  lats: "Lats",
  lowerBack: "Lower back",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  upperAbs: "Upper abs",
  lowerAbs: "Lower abs",
  obliques: "Obliques",
  serratus: "Serratus",
  hipFlexors: "Hip flexors",
  quads: "Quads",
  adductors: "Adductors",
  glutes: "Glutes",
  hamstrings: "Hamstrings",
  calves: "Calves",
  neckFront: "Neck (front)",
  neckBack: "Neck (back)",
};
