import { Outlet } from "react-router";
import IosInstallPrompt from "../features/pwa/components/IosInstallPrompt";

export default function AppLayout() {
  return (
    <div className="min-h-screen text-(--text-strong)">
      <main className="min-h-screen">
        <Outlet />
      </main>
      <IosInstallPrompt />
    </div>
  );
}
