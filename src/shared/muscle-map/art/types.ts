import type { MuscleId } from "@/shared/muscle-map/muscles";

export interface MuscleShape {
  d: string;
  /** Omit for purely decorative shapes (kneecap, hand, ...). */
  muscle?: MuscleId;
}

/**
 * One drawing (e.g. "torso front"). Symmetric views are authored as the
 * left half only and mirrored around `mirrorAxis`; `outline` is then an
 * open path that starts and ends on the axis.
 */
export interface MuscleView {
  id: string;
  label: string;
  width: number;
  height: number;
  outline: string;
  mirrorAxis?: number;
  shapes: MuscleShape[];
  /** Stroke-only lines (jaw line, kneecap outline, ...). */
  details?: string[];
}
