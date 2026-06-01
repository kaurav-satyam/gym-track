import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { registerSW } from "virtual:pwa-register";
import AppRouter from "./app/AppRouter";
import "./index.css";

registerSW({
  immediate: true,
  onOfflineReady() {
    console.info("GymTrack is ready to work offline.");
  },
  onRegisteredSW(swUrl, registration) {
    console.info("Service worker registered:", swUrl);
    registration?.update();
  },
  onRegisterError(error) {
    console.error("Service worker registration failed:", error);
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={AppRouter} />
  </StrictMode>,
);
