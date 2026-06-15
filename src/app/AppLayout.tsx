import { useEffect } from "react";
import { Outlet } from "react-router";
import IosInstallPrompt from "../features/pwa/components/IosInstallPrompt";
import AppNavigation from "./AppNavigation";
import { applyThemePreference, getStoredThemePreference } from "./theme";

export default function AppLayout() {
  useEffect(() => {
    applyThemePreference(getStoredThemePreference());
  }, []);

  return (
    <div className="min-h-screen text-(--text-strong)">
      <main className="min-h-screen pb-24 md:pb-0 md:pl-21">
        <Outlet />
      </main>
      <AppNavigation />
      <IosInstallPrompt />
    </div>
  );
}
