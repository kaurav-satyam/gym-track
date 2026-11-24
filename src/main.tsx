import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { registerServiceWorker } from "@/app/pwa";
import { router } from "@/app/router";
import { applyThemePreference, getStoredThemePreference } from "@/app/theme";
import "./index.css";

// Apply the saved theme before the first paint so there's no flash.
applyThemePreference(getStoredThemePreference());
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
