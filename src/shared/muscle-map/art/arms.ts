import type { MuscleView } from "./types";

// A single hanging arm, 90x200. Not mirrored.
const ARM_OUTLINE =
  "M45,8 C60,8 70,18 70,34 C70,54 66,78 62,100 C64,112 64,126 60,142 " +
  "C58,154 56,164 55,172 C58,178 59,186 57,194 C52,198 40,198 35,194 " +
  "C33,186 34,178 37,172 C35,160 30,146 28,130 C26,118 27,108 30,100 " +
  "C26,80 22,56 22,36 C22,18 32,8 45,8 Z";

const SHOULDER_CAP =
  "M22,36 C22,18 32,8 45,8 C60,8 70,18 70,34 C62,42 54,46 46,46 C38,46 30,42 22,36 Z";

const HAND =
  "M37,172 L55,172 C58,178 59,186 57,194 C52,198 40,198 35,194 C33,186 34,178 37,172 Z";

export const armFront: MuscleView = {
  id: "arm-front",
  label: "Front",
  width: 90,
  height: 200,
  outline: ARM_OUTLINE,
  shapes: [
    { d: SHOULDER_CAP },
    {
      muscle: "biceps",
      d: "M46,48 C58,50 63,62 62,78 C61,88 56,96 48,100 C40,96 33,88 31,78 C29,62 34,50 46,48 Z",
    },
    {
      muscle: "forearms",
      d: "M48,104 C55,104 59,103 61,102 C62,114 61,128 58,142 C56,152 54,162 53,170 L47,170 C46,150 46,124 48,104 Z",
    },
    {
      muscle: "forearms",
      d: "M33,104 C38,104 44,104 48,104 C46,124 46,150 47,170 L39,170 C36,160 31,146 29,130 C28,120 29,110 33,104 Z",
    },
    { d: HAND },
  ],
};

export const armBack: MuscleView = {
  id: "arm-back",
  label: "Back",
  width: 90,
  height: 200,
  outline: ARM_OUTLINE,
  shapes: [
    { d: SHOULDER_CAP },
    {
      muscle: "triceps",
      d: "M46,48 C56,48 64,52 65,62 C65,76 62,88 58,96 L50,98 C48,84 46,66 46,48 Z",
    },
    {
      muscle: "triceps",
      d: "M46,48 C46,66 48,84 50,98 L44,98 C40,94 36,94 32,96 C28,82 26,64 28,54 C32,50 38,48 46,48 Z",
    },
    {
      muscle: "forearms",
      d: "M33,104 C38,104 44,104 48,104 C46,124 46,150 47,170 L39,170 C36,160 31,146 29,130 C28,120 29,110 33,104 Z",
    },
    {
      muscle: "forearms",
      d: "M48,104 C55,104 59,103 61,102 C62,114 61,128 58,142 C56,152 54,162 53,170 L47,170 C46,150 46,124 48,104 Z",
    },
    { d: HAND },
  ],
};
