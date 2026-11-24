import { useId } from "react";
import type { MuscleView } from "./art";
import type { MuscleId } from "./muscles";

const VIEW_GAP = 16;

export interface MuscleFigureProps {
  views: MuscleView[];
  title: string;
  /** Muscles painted in the primary (red) color. */
  primary?: readonly MuscleId[];
  /** Muscles painted in the secondary (orange) color. Primary wins on overlap. */
  secondary?: readonly MuscleId[];
  /** Sizing classes for the <svg>; defaults to full width. */
  className?: string;
  /** Show "Front"/"Back" captions when the figure has more than one view. */
  showViewLabels?: boolean;
}

/** Generic renderer: draws one or more views side by side in a single SVG. */
export default function MuscleFigure({
  views,
  title,
  primary = [],
  secondary = [],
  showViewLabels = true,
  className,
}: MuscleFigureProps) {
  const titleId = useId();
  const primarySet = new Set<MuscleId>(primary);
  const secondarySet = new Set<MuscleId>(secondary);
  const withLabels = showViewLabels && views.length > 1;
  const width =
    views.reduce((total, view) => total + view.width, 0) +
    VIEW_GAP * (views.length - 1);
  // Captions scale with the figure width so they render at a similar size
  // whether the figure is two narrow arms or two wide torsos.
  const labelSize = Math.round(width * 0.045);
  const height =
    Math.max(...views.map((view) => view.height)) +
    (withLabels ? labelSize + 6 : 0);

  function fillFor(muscle?: MuscleId) {
    if (muscle && primarySet.has(muscle)) {
      return "var(--muscle-primary)";
    }

    if (muscle && secondarySet.has(muscle)) {
      return "var(--muscle-secondary)";
    }

    return "var(--muscle-idle)";
  }

  const offsets = views.map((_, index) =>
    views
      .slice(0, index)
      .reduce((total, view) => total + view.width + VIEW_GAP, 0),
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby={titleId}
      className={className ?? "h-auto w-full"}
    >
      <title id={titleId}>{title}</title>
      {views.map((view, viewIndex) => {
        const x = offsets[viewIndex];
        const mirror =
          view.mirrorAxis == null
            ? undefined
            : `matrix(-1 0 0 1 ${view.mirrorAxis * 2} 0)`;
        const halves = mirror ? [undefined, mirror] : [undefined];

        return (
          <g key={view.id} transform={`translate(${x} 0)`}>
            {halves.map((transform, index) => (
              <g key={index} transform={transform}>
                <path
                  d={closeHalfOutline(view)}
                  fill="var(--muscle-idle)"
                  stroke="none"
                />
                {view.shapes.map((shape, shapeIndex) => (
                  <path
                    key={shapeIndex}
                    d={shape.d}
                    fill={fillFor(shape.muscle)}
                    stroke="var(--muscle-outline)"
                    strokeWidth={1.25}
                    strokeLinejoin="round"
                    style={{ transition: "fill 200ms ease" }}
                  />
                ))}
                {view.details?.map((detail, detailIndex) => (
                  <path
                    key={detailIndex}
                    d={detail}
                    fill="none"
                    stroke="var(--muscle-outline)"
                    strokeWidth={1.25}
                    strokeLinecap="round"
                  />
                ))}
                <path
                  d={view.outline}
                  fill="none"
                  stroke="var(--muscle-outline)"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              </g>
            ))}
            {withLabels && (
              <text
                x={view.width / 2}
                y={height - 3}
                textAnchor="middle"
                fontSize={labelSize}
                fill="var(--text-muted)"
              >
                {view.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Mirrored views store an open half outline that starts and ends on the axis.
 * Close it slightly past the axis so the two filled halves overlap without a seam.
 */
function closeHalfOutline(view: MuscleView) {
  if (view.mirrorAxis == null) {
    return view.outline;
  }

  const numbers = view.outline.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  const startY = numbers[1];
  const endY = numbers[numbers.length - 1];
  const seamX = view.mirrorAxis + 0.75;

  return `${view.outline} L${seamX},${endY} L${seamX},${startY} Z`;
}
