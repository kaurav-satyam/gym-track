import { createStore } from "@/shared/lib/createStore";
import { safeStorage } from "@/shared/lib/storage";

/**
 * Rest timer between sets. Starts when a set is logged, runs app-wide (it
 * keeps going if you switch screens) and buzzes when rest is over. Times are
 * stored as absolute timestamps so it stays correct if the tab sleeps.
 */

const STORAGE_KEY = "gym-track-rest-seconds";
const DEFAULT_SECONDS = 90;
const DONE_VISIBLE_MS = 4000;

/** Selectable durations in seconds; 0 turns the timer off. */
export const REST_OPTIONS = [0, 60, 90, 120, 180] as const;

export type RestTimerState =
  | { status: "running"; endsAt: number; totalMs: number }
  | { status: "done" }
  | null;

const timer = createStore<RestTimerState>(null);
const restSeconds = createStore<number>(readRestSeconds());
let finishTimeout: ReturnType<typeof setTimeout> | undefined;
let hideTimeout: ReturnType<typeof setTimeout> | undefined;

function readRestSeconds() {
  const stored = Number(safeStorage.get(STORAGE_KEY));

  return (REST_OPTIONS as readonly number[]).includes(stored) && safeStorage.get(STORAGE_KEY) !== null
    ? stored
    : DEFAULT_SECONDS;
}

export function setRestSeconds(seconds: number) {
  safeStorage.set(STORAGE_KEY, String(seconds));
  restSeconds.set(seconds);

  if (seconds === 0) {
    stopRestTimer();
  }
}

export const useRestSeconds = restSeconds.useStore;
export const useRestTimer = timer.useStore;

export function startRestTimer() {
  const seconds = restSeconds.get();

  if (seconds > 0) {
    run(Date.now() + seconds * 1000, seconds * 1000);
  }
}

export function addRestTime(seconds: number) {
  const state = timer.get();

  if (state?.status === "running") {
    run(state.endsAt + seconds * 1000, state.totalMs + seconds * 1000);
  }
}

export function stopRestTimer() {
  clearTimeout(finishTimeout);
  clearTimeout(hideTimeout);
  timer.set(null);
}

function run(endsAt: number, totalMs: number) {
  clearTimeout(finishTimeout);
  clearTimeout(hideTimeout);
  timer.set({ status: "running", endsAt, totalMs });
  finishTimeout = setTimeout(finish, Math.max(0, endsAt - Date.now()));
}

function finish() {
  navigator.vibrate?.([200, 100, 200]);
  timer.set({ status: "done" });
  hideTimeout = setTimeout(() => timer.set(null), DONE_VISIBLE_MS);
}
