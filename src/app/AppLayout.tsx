import { Outlet } from "react-router";
import IosInstallPrompt from "@/features/pwa/components/IosInstallPrompt";
import { RestTimerBar } from "@/features/rest-timer";
import { Toaster } from "@/shared/ui";
import AppNavigation from "./AppNavigation";

export default function AppLayout() {
  return (
    <div className="min-h-screen text-(--text-strong)">
      {/* Installed on iOS the status bar is translucent: keep content clear of it
          and give the clock a solid backdrop while scrolling. */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-30 h-[env(safe-area-inset-top)] bg-(--app-bg-start)/90 backdrop-blur-xl md:hidden"
      />
      <main className="min-h-screen pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+5rem)] md:pb-0 md:pl-21">
        <Outlet />
      </main>

      {/* Bottom dock: toasts and the rest timer float just above the tab bar. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-40 md:bottom-6 md:left-21">
        <div className="pointer-events-auto mx-auto flex w-full max-w-xl flex-col gap-2 px-3">
          <Toaster />
          <RestTimerBar />
        </div>
      </div>

      <AppNavigation />
      <IosInstallPrompt />
    </div>
  );
}
