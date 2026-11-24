import type { MuscleGroup } from "../muscles";
import { armBack, armFront } from "./arms";
import { legsBack, legsFront } from "./legs";
import { neckBack, neckFront } from "./neck";
import { torsoBack, torsoFront } from "./torso";
import type { MuscleView } from "./types";

export type { MuscleShape, MuscleView } from "./types";

/** Which drawings make up each group's figure. */
export const GROUP_VIEWS: Record<MuscleGroup, MuscleView[]> = {
  chest: [torsoFront],
  shoulders: [torsoFront, torsoBack],
  back: [torsoBack],
  arms: [armFront, armBack],
  core: [torsoFront],
  legs: [legsFront, legsBack],
  neck: [neckFront, neckBack],
};
