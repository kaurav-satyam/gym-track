export { default as MuscleFigure } from "./MuscleFigure";
export { MuscleTargetsPreview, MuscleThumbnail } from "./ExerciseMuscles";
export { default as MuscleGroupFigure } from "./MuscleGroupFigure";
export type { MuscleGroupFigureProps } from "./MuscleGroupFigure";
export {
  ArmMuscles,
  BackMuscles,
  ChestMuscles,
  CoreMuscles,
  LegMuscles,
  NeckMuscles,
  ShoulderMuscles,
} from "./MuscleGroups";
export type { MuscleGroupProps } from "./MuscleGroups";
export {
  MUSCLE_GROUPS,
  MUSCLE_GROUP_LABELS,
  MUSCLE_LABELS,
  type MuscleGroup,
  type MuscleId,
  type MuscleOf,
} from "./muscles";
export {
  getMuscleTargets,
  hasMuscleTargets,
  type MuscleTargets,
} from "./tagTargets";
