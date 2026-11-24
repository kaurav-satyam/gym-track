import { useEffect, useState } from "react";
import { loadDefaultMuscleTags } from "../../../shared/constants/muscleTags";
import { cn } from "../../../shared/ui";

interface IMuscleTagEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

/** Selected tags up front; the full list opens on demand to keep the page short. */
export default function MuscleTagEditor({ tags, onChange }: IMuscleTagEditorProps) {
  const [open, setOpen] = useState(false);
  const [defaultTags, setDefaultTags] = useState<string[]>([]);

  useEffect(() => {
    if (!open || defaultTags.length > 0) {
      return;
    }

    loadDefaultMuscleTags()
      .then(setDefaultTags)
      .catch((error) => console.error("Muscle tags could not be loaded:", error));
  }, [open, defaultTags.length]);

  // Stable order while editing so chips don't jump around when toggled.
  const options = open
    ? [...tags.filter((tag) => !defaultTags.includes(tag)), ...defaultTags]
    : tags;

  function toggle(tag: string) {
    onChange(tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag]);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {options.map((tag) => {
          const selected = tags.includes(tag);

          return (
            <button
              key={tag}
              type="button"
              aria-pressed={selected}
              className={cn(
                "min-h-9 rounded-full px-3 text-sm transition-colors",
                selected
                  ? "bg-(--accent) font-medium text-(--accent-ink)"
                  : "bg-(--surface-control) text-(--text-soft)",
              )}
              onClick={() => toggle(tag)}
            >
              {tag}
            </button>
          );
        })}
        {!open && tags.length === 0 && (
          <span className="py-2 text-sm text-(--text-muted)">No muscles tagged.</span>
        )}
      </div>
      <button
        type="button"
        className="min-h-9 text-sm font-medium text-(--accent)"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? "Done" : tags.length > 0 ? "Edit muscles" : "Add muscles"}
      </button>
    </div>
  );
}
