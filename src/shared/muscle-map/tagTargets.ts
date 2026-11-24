import {
  MUSCLE_GROUPS,
  type MuscleGroup,
  type MuscleId,
  type MuscleOf,
} from "./muscles";

export type MuscleTargets = { [G in MuscleGroup]?: MuscleOf<G>[] };

type TagTarget = { group: MuscleGroup; muscles: readonly MuscleId[] };

function whole(group: MuscleGroup): TagTarget {
  return { group, muscles: MUSCLE_GROUPS[group] };
}

/**
 * The app's muscle tags (public/data/muscleTags.json) mapped to body-map
 * regions. Keys are lower-case. Non-anatomical tags (Cardio, Mobility, ...)
 * are intentionally absent.
 */
const TAG_TARGETS: Record<string, TagTarget[]> = {
  chest: [whole("chest")],
  "upper chest": [{ group: "chest", muscles: ["upperChest"] }],
  "lower chest": [{ group: "chest", muscles: ["lowerChest"] }],
  "inner chest": [{ group: "chest", muscles: ["innerChest"] }],

  back: [whole("back")],
  lats: [{ group: "back", muscles: ["lats"] }],
  "upper back": [{ group: "back", muscles: ["rhomboids", "teres"] }],
  "lower back": [{ group: "back", muscles: ["lowerBack"] }],
  rhomboids: [{ group: "back", muscles: ["rhomboids"] }],
  trhomboids: [{ group: "back", muscles: ["rhomboids"] }],
  traps: [{ group: "back", muscles: ["traps"] }],

  shoulders: [whole("shoulders")],
  "front delts": [{ group: "shoulders", muscles: ["frontDelts"] }],
  "side delts": [{ group: "shoulders", muscles: ["sideDelts"] }],
  "rear delts": [{ group: "shoulders", muscles: ["rearDelts"] }],

  biceps: [{ group: "arms", muscles: ["biceps"] }],
  triceps: [{ group: "arms", muscles: ["triceps"] }],
  forearms: [{ group: "arms", muscles: ["forearms"] }],
  grip: [{ group: "arms", muscles: ["forearms"] }],

  core: [
    { group: "core", muscles: ["upperAbs", "lowerAbs", "obliques"] },
    { group: "back", muscles: ["lowerBack"] },
  ],
  abs: [{ group: "core", muscles: ["upperAbs", "lowerAbs"] }],
  obliques: [{ group: "core", muscles: ["obliques"] }],
  "hip flexors": [{ group: "legs", muscles: ["hipFlexors"] }],

  legs: [
    {
      group: "legs",
      muscles: ["quads", "hamstrings", "glutes", "calves", "adductors"],
    },
  ],
  quads: [{ group: "legs", muscles: ["quads"] }],
  hamstrings: [{ group: "legs", muscles: ["hamstrings"] }],
  glutes: [{ group: "legs", muscles: ["glutes"] }],
  calves: [{ group: "legs", muscles: ["calves"] }],
  adductors: [{ group: "legs", muscles: ["adductors"] }],

  neck: [whole("neck")],
};

/**
 * Turns exercise muscle tags into per-group highlights, e.g.
 * ["Upper Chest", "Triceps"] -> { chest: ["upperChest"], arms: ["triceps"] }.
 * Groups keep the order of the first tag that touched them.
 */
export function getMuscleTargets(tags: readonly string[]): MuscleTargets {
  const targets = new Map<MuscleGroup, Set<MuscleId>>();

  for (const tag of tags) {
    for (const { group, muscles } of TAG_TARGETS[tag.trim().toLowerCase()] ?? []) {
      const groupMuscles = targets.get(group) ?? new Set<MuscleId>();

      muscles.forEach((muscle) => groupMuscles.add(muscle));
      targets.set(group, groupMuscles);
    }
  }

  return Object.fromEntries(
    [...targets].map(([group, muscles]) => [group, [...muscles]]),
  ) as MuscleTargets;
}

/** True when at least one tag maps to a drawable muscle. */
export function hasMuscleTargets(tags: readonly string[] | undefined) {
  return (tags ?? []).some(
    (tag) => TAG_TARGETS[tag.trim().toLowerCase()] != null,
  );
}
