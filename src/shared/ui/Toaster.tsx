import { dismissToast, useToast } from "../lib/toast";

/** Renders the current toast. Mount once, in the bottom dock of the layout. */
export default function Toaster() {
  const toast = useToast();

  if (!toast) {
    return null;
  }

  return (
    <div
      key={toast.id}
      role="status"
      className="motion-surface flex w-full items-center gap-3 rounded-2xl bg-(--text-strong) py-2 pl-4 pr-2 text-(--app-bg) shadow-(--shadow-panel)"
    >
      <p className="min-w-0 flex-1 py-1.5 text-sm font-medium">{toast.message}</p>
      {toast.actionLabel && (
        <button
          type="button"
          className="min-h-9 shrink-0 rounded-xl px-3 text-sm font-bold text-(--accent-on-inverse) transition active:scale-95"
          onClick={() => {
            toast.onAction?.();
            dismissToast(toast.id);
          }}
        >
          {toast.actionLabel}
        </button>
      )}
    </div>
  );
}
