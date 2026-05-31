import { Outlet } from "react-router";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
