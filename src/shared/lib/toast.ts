import { createStore } from "./createStore";

export interface Toast {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const store = createStore<Toast | null>(null);
let nextId = 0;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

/** Shows a short message at the bottom of the screen, optionally with an action (e.g. Undo). */
export function showToast(toast: Omit<Toast, "id">, durationMs = 5000) {
  nextId += 1;
  const id = nextId;

  store.set({ ...toast, id });
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => dismissToast(id), durationMs);
}

export function dismissToast(id?: number) {
  if (id === undefined || store.get()?.id === id) {
    store.set(null);
  }
}

export const useToast = store.useStore;
