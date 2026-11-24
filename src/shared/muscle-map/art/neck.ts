import type { MuscleView } from "./types";

// Left half of head, neck and shoulder tops (120x140), mirrored around x=60.
const NECK_OUTLINE =
  "M60,6 C45,6 36,18 36,34 C36,46 38,56 42,64 C44,70 46,76 46,84 " +
  "C46,90 45,94 44,98 C36,102 24,106 16,110 C10,114 8,120 8,130 L8,136 L60,136";

export const neckFront: MuscleView = {
  id: "neck-front",
  label: "Front",
  width: 120,
  height: 140,
  mirrorAxis: 60,
  outline: NECK_OUTLINE,
  shapes: [
    {
      muscle: "neckFront",
      d: "M43,66 C47,76 53,90 59,102 L59,108 C52,102 46,92 43,82 C42,76 42,70 43,66 Z",
    },
    {
      muscle: "traps",
      d: "M45,92 C45,95 44,97 44,98 C36,102 24,106 16,110 C28,111 40,108 52,106 C49,102 47,97 45,92 Z",
    },
  ],
  details: ["M43,66 C48,74 54,78 60,78"],
};

export const neckBack: MuscleView = {
  id: "neck-back",
  label: "Back",
  width: 120,
  height: 140,
  mirrorAxis: 60,
  outline: NECK_OUTLINE,
  shapes: [
    {
      muscle: "neckBack",
      d: "M44,68 C46,76 46,86 46,96 C50,98 55,100 60,100 L60,68 C54,68 48,68 44,68 Z",
    },
    {
      muscle: "traps",
      d: "M60,100 C55,100 50,98 46,96 C46,97 45,97 44,98 C36,102 24,106 16,110 C30,114 46,122 60,132 Z",
    },
  ],
};
