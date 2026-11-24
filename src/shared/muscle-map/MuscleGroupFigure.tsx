import type { ComponentType } from "react";
import {
  ArmMuscles,
  BackMuscles,
  ChestMuscles,
  CoreMuscles,
  LegMuscles,
  NeckMuscles,
  ShoulderMuscles,
  type MuscleGroupProps,
} from "./MuscleGroups";
import type { MuscleGroup, MuscleOf } from "./muscles";

const GROUP_COMPONENTS: {
  [G in MuscleGroup]: ComponentType<MuscleGroupProps<G>>;
} = {
  chest: ChestMuscles,
  shoulders: ShoulderMuscles,
  back: BackMuscles,
  arms: ArmMuscles,
  core: CoreMuscles,
  legs: LegMuscles,
  neck: NeckMuscles,
};

export type MuscleGroupFigureProps<G extends MuscleGroup> = Omit<
  MuscleGroupProps<G>,
  "highlighted"
> & {
  group: G;
  /** Muscles inside `group` to paint red. */
  muscles?: readonly MuscleOf<G>[];
};

/**
 * Parent component: pick a group and the muscles to highlight inside it.
 *
 * <MuscleGroupFigure group="chest" muscles={["upperChest", "innerChest"]} />
 */
export default function MuscleGroupFigure<G extends MuscleGroup>({
  group,
  muscles,
  ...rest
}: MuscleGroupFigureProps<G>) {
  const GroupComponent = GROUP_COMPONENTS[group] as ComponentType<
    MuscleGroupProps<G>
  >;

  return <GroupComponent highlighted={muscles} {...rest} />;
}
