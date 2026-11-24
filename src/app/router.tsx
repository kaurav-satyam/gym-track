import type { ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import AppLayout from "./AppLayout";
import TodayRedirect from "./TodayRedirect";

/**
 * Routes. Screens are lazy-loaded so each one ships as its own chunk; the
 * service worker precaches all chunks, so this costs nothing offline.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    // Nothing to show while the first screen chunk loads (it's near-instant).
    HydrateFallback: () => null,
    children: [
      { index: true, Component: TodayRedirect },
      {
        path: "days/:day",
        lazy: () => screen(import("@/features/workout-day/screens/WorkoutDayScreen")),
      },
      {
        path: "days/:day/add-exercise",
        lazy: () => screen(import("@/features/add-exercise/screens/AddExerciseScreen")),
      },
      {
        path: "exercises/:exerciseId",
        lazy: () => screen(import("@/features/exercise-detail/screens/ExerciseDetailScreen")),
      },
      {
        path: "progress",
        lazy: () => screen(import("@/features/progress/screens/ProgressScreen")),
      },
      {
        path: "settings",
        lazy: () => screen(import("@/features/settings/screens/SettingsScreen")),
      },

      // Unknown URLs go to Today.
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

async function screen(module: Promise<{ default: ComponentType }>) {
  return { Component: (await module).default };
}
