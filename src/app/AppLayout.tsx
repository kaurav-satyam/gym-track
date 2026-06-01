import { Outlet } from "react-router";

export default function AppLayout() {
  return (
    <div className="min-h-screen text-(--text-strong)">
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
