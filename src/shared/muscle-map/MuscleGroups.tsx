import { GROUP_VIEWS } from "./art";
import MuscleFigure from "./MuscleFigure";
import {
  MUSCLE_GROUP_LABELS,
  MUSCLE_LABELS,
  isMuscleInGroup,
  type MuscleGroup,
  type MuscleOf,
} from "./muscles";

export interface MuscleGroupProps<G extends MuscleGroup> {
  /** Muscles to paint red, e.g. ["upperChest", "innerChest"]. */
  highlighted?: readonly MuscleOf<G>[];
  /** Muscles to paint orange (e.g. secondary movers). */
  secondary?: readonly MuscleOf<G>[];
  showViewLabels?: boolean;
  className?: string;
}

function GroupFigure<G extends MuscleGroup>({
  group,
  highlighted = [],
  secondary = [],
  ...rest
}: MuscleGroupProps<G> & { group: G }) {
  // Guard against ids from untyped data (e.g. JSON) that aren't in this group.
  const primary = highlighted.filter((muscle) => isMuscleInGroup(group, muscle));
  const secondaryOnly = secondary.filter(
    (muscle) => isMuscleInGroup(group, muscle) && !primary.includes(muscle),
  );
  const targeted = [...primary, ...secondaryOnly].map(
    (muscle) => MUSCLE_LABELS[muscle],
  );
  const title =
    MUSCLE_GROUP_LABELS[group] +
    (targeted.length > 0 ? `: ${targeted.join(", ")}` : ": no muscles targeted");

  return (
    <MuscleFigure
      views={GROUP_VIEWS[group]}
      title={title}
      primary={primary}
      secondary={secondaryOnly}
      {...rest}
    />
  );
}

export function ChestMuscles(props: MuscleGroupProps<"chest">) {
  return <GroupFigure group="chest" {...props} />;
}

export function ShoulderMuscles(props: MuscleGroupProps<"shoulders">) {
  return <GroupFigure group="shoulders" {...props} />;
}

export function BackMuscles(props: MuscleGroupProps<"back">) {
  return <GroupFigure group="back" {...props} />;
}

export function ArmMuscles(props: MuscleGroupProps<"arms">) {
  return <GroupFigure group="arms" {...props} />;
}

export function CoreMuscles(props: MuscleGroupProps<"core">) {
  return <GroupFigure group="core" {...props} />;
}

export function LegMuscles(props: MuscleGroupProps<"legs">) {
  return <GroupFigure group="legs" {...props} />;
}

export function NeckMuscles(props: MuscleGroupProps<"neck">) {
  return <GroupFigure group="neck" {...props} />;
}
