import { Outlet } from "react-router";
import IosInstallPrompt from "@/features/pwa/components/IosInstallPrompt";
import AppNavigation from "./AppNavigation";

export default function AppLayout() {
  return (
    <div className="min-h-screen text-(--text-strong)">
      <main className="min-h-screen pb-20 md:pb-0 md:pl-21">
        <Outlet />
      </main>
      <AppNavigation />
      <IosInstallPrompt />
    </div>
  );
}
