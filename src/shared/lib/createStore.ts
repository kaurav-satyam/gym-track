import { useSyncExternalStore } from "react";

/**
 * Minimal global store: module-level state that any component can read with
 * `useStore()` and any code can update with `set()`. Used for app-wide,
 * non-persisted UI state (toasts, the rest timer).
 */
export function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    get: () => state,
    set(next: T) {
      state = next;
      listeners.forEach((listener) => listener());
    },
    useStore: () => useSyncExternalStore(subscribe, () => state),
  };
}
