import { GROUP_VIEWS } from "./art";
import { cn } from "@/shared/ui/cn";
import MuscleFigure from "./MuscleFigure";
import {
  MUSCLE_GROUP_LABELS,
  MUSCLE_LABELS,
  type MuscleGroup,
  type MuscleId,
} from "./muscles";
import { getMuscleTargets } from "./tagTargets";

interface IExerciseMusclesProps {
  /** The exercise's muscle tags, e.g. ["Upper Chest", "Triceps"]. */
  tags: readonly string[] | undefined;
  className?: string;
}

function listTargetedGroups(tags: readonly string[] | undefined) {
  const targets = getMuscleTargets(tags ?? []);

  return (Object.keys(targets) as MuscleGroup[]).map((group) => ({
    group,
    muscles: (targets[group] ?? []) as MuscleId[],
  }));
}

/**
 * Small icon-sized figure for the exercise's main muscle group (the group of
 * its first anatomical tag). Shows one view only: the one that actually
 * contains a highlighted muscle. Renders nothing for tags like "Cardio".
 */
export function MuscleThumbnail({ tags, className }: IExerciseMusclesProps) {
  const [primary] = listTargetedGroups(tags);

  if (!primary) {
    return null;
  }

  const views = GROUP_VIEWS[primary.group];
  const view =
    views.find((candidate) =>
      candidate.shapes.some(
        (shape) => shape.muscle && primary.muscles.includes(shape.muscle),
      ),
    ) ?? views[0];
  const labels = primary.muscles.map((muscle) => MUSCLE_LABELS[muscle]);

  return (
    <MuscleFigure
      views={[view]}
      primary={primary.muscles}
      title={`${MUSCLE_GROUP_LABELS[primary.group]}: ${labels.join(", ")}`}
      showViewLabels={false}
      className={className}
    />
  );
}

/** Every targeted group side by side, each with a caption. */
export function MuscleTargetsPreview({ tags, className }: IExerciseMusclesProps) {
  const groups = listTargetedGroups(tags);

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className={cn("grid grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))] gap-2", className)}>
      {groups.map(({ group, muscles }) => (
        <figure
          key={group}
          className="flex min-w-0 flex-col items-center gap-2 rounded-2xl bg-(--surface-inset) px-2 pb-2.5 pt-3"
        >
          <div className="flex h-28 w-full items-center justify-center">
            <MuscleFigure
              views={GROUP_VIEWS[group]}
              primary={muscles}
              title={`${MUSCLE_GROUP_LABELS[group]}: ${muscles
                .map((muscle) => MUSCLE_LABELS[muscle])
                .join(", ")}`}
              className="max-h-28 w-auto max-w-full"
            />
          </div>
          <figcaption className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-muted)">
            {MUSCLE_GROUP_LABELS[group]}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
