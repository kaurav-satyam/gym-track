import type { MuscleView } from "./types";

// Left half of a 200x200 torso, mirrored around x=100.
const TORSO_OUTLINE =
  "M100,6 L90,6 C90,16 89,24 87,31 C77,36 65,38 54,41 C40,45 30,55 29,69 " +
  "C28,82 28,97 30,112 L47,114 C48,104 49,96 51,89 C55,110 58,130 60,150 " +
  "C60,162 58,172 56,184 C70,191 86,196 100,198";

const SIDE_DELT =
  "M56,41 C42,44 31,54 29,68 C28,78 29,88 32,98 L38,100 " +
  "C37,88 37,76 40,64 C43,54 48,47 56,41 Z";

// Inner head of the deltoid: front delt on the front view, rear delt on the back.
const INNER_DELT =
  "M56,41 C59,42 62,43 63,45 C58,58 54,72 52,86 C48,92 43,97 38,100 " +
  "C37,88 37,76 40,64 C43,54 48,47 56,41 Z";

function absBlock(top: number, bottom: number) {
  return `M88,${top} L99,${top} L99,${bottom} L88,${bottom} Q86,${bottom} 86,${bottom - 2} L86,${top + 2} Q86,${top} 88,${top} Z`;
}

export const torsoFront: MuscleView = {
  id: "torso-front",
  label: "Front",
  width: 200,
  height: 200,
  mirrorAxis: 100,
  outline: TORSO_OUTLINE,
  shapes: [
    {
      muscle: "traps",
      d: "M87,31 C77,36 66,38 56,41 C66,43 77,42 86,39 Z",
    },
    { muscle: "sideDelts", d: SIDE_DELT },
    { muscle: "frontDelts", d: INNER_DELT },
    {
      muscle: "upperChest",
      d: "M88,47 L63,45 C61,52 59,60 57,68 C67,64 78,61 88,60 Z",
    },
    {
      muscle: "midChest",
      d: "M88,60 C78,61 67,64 57,68 C55,74 53,80 52,86 C64,86 76,86 88,86 Z",
    },
    {
      muscle: "lowerChest",
      d: "M88,86 C76,86 64,86 52,86 C60,98 74,105 88,106 Z",
    },
    {
      muscle: "innerChest",
      d: "M98,47 L88,47 L88,106 C93,106 97,104 98,101 Z",
    },
    {
      muscle: "biceps",
      d: "M38,100 C35,104 32,108 31,112 L46,114 C47,108 48,103 50,95 C46,98 42,100 38,100 Z",
    },
    {
      muscle: "obliques",
      d:
        "M85,108 C73,107 63,104 56,99 C58,116 60,134 60,150 C60,160 59,170 57,180 " +
        "C66,184 76,188 86,190 Z",
    },
    { muscle: "serratus", d: "M57,101 L68,106 L67,111 L58,108 Z" },
    { muscle: "serratus", d: "M58,112 L69,116 L68,121 L59,119 Z" },
    { muscle: "serratus", d: "M59,123 L70,126 L69,131 L60,130 Z" },
    { muscle: "upperAbs", d: absBlock(109, 124) },
    { muscle: "upperAbs", d: absBlock(127, 142) },
    { muscle: "lowerAbs", d: absBlock(145, 160) },
    {
      muscle: "lowerAbs",
      d: "M86,163 L99,163 L99,194 C94,193 90,192 86,190 Z",
    },
  ],
};

export const torsoBack: MuscleView = {
  id: "torso-back",
  label: "Back",
  width: 200,
  height: 200,
  mirrorAxis: 100,
  outline: TORSO_OUTLINE,
  shapes: [
    { muscle: "sideDelts", d: SIDE_DELT },
    { muscle: "rearDelts", d: INNER_DELT },
    {
      muscle: "traps",
      d:
        "M100,6 L90,6 C90,16 89,24 87,31 C77,36 67,39 58,42 C67,48 77,54 87,58 " +
        "C92,60 96,62 100,64 Z",
    },
    {
      muscle: "rhomboids",
      d: "M100,64 C96,62 92,60 87,58 C85,70 86,90 90,104 C94,110 97,116 99,122 L100,122 Z",
    },
    {
      muscle: "teres",
      d: "M87,58 C77,54 68,49 63,46 C59,60 56,72 53,84 C64,85 76,85 87,85 C86,76 85,66 87,58 Z",
    },
    {
      muscle: "lats",
      d:
        "M53,87 C64,87 76,86 87,86 C88,96 92,108 98,124 C92,134 82,144 62,152 " +
        "C61,132 58,110 53,87 Z",
    },
    {
      muscle: "lowerBack",
      d: "M99,125 C92,134 82,145 62,153 C62,162 60,172 58,180 C72,188 86,194 99,196 Z",
    },
    {
      muscle: "triceps",
      d: "M38,100 C35,104 32,108 31,112 L46,114 C47,108 48,103 50,95 C46,98 42,100 38,100 Z",
    },
  ],
};
