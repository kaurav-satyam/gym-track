import { Activity, Dumbbell, Settings, type LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { getTodayWorkoutDay } from "@/domain/weekdays";
import { AppLogo, cn } from "@/shared/ui";

interface INavigationItem {
  label: string;
  icon: LucideIcon;
  to: string;
  isActive: (pathname: string) => boolean;
}

function getNavigationItems(): INavigationItem[] {
  return [
    {
      label: "Today",
      icon: Dumbbell,
      to: "/days/" + getTodayWorkoutDay(),
      isActive: (pathname) =>
        pathname.startsWith("/days/") || pathname.startsWith("/exercises/"),
    },
    {
      label: "Progress",
      icon: Activity,
      to: "/progress",
      isActive: (pathname) => pathname === "/progress",
    },
    {
      label: "Settings",
      icon: Settings,
      to: "/settings",
      isActive: (pathname) => pathname === "/settings",
    },
  ];
}

export default function AppNavigation() {
  const { pathname } = useLocation();
  const items = getNavigationItems();

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className="fixed inset-y-0 left-0 z-40 hidden w-21 flex-col items-center gap-6 border-r border-(--nav-border) bg-(--nav-bg) py-4 md:flex"
      >
        <NavLink aria-label="GymTrack home" to={items[0].to} className="rounded-[18px]">
          <AppLogo size="lg" />
        </NavLink>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <NavItem key={item.label} item={item} active={item.isActive(pathname)} layout="rail" />
          ))}
        </div>
      </nav>

      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-(--nav-border) bg-(--nav-bg) backdrop-blur-xl md:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-3 pb-[env(safe-area-inset-bottom)]">
          {items.map((item) => (
            <NavItem key={item.label} item={item} active={item.isActive(pathname)} layout="bar" />
          ))}
        </div>
      </nav>
    </>
  );
}

function NavItem({
  item,
  active,
  layout,
}: {
  item: INavigationItem;
  active: boolean;
  layout: "rail" | "bar";
}) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      title={layout === "rail" ? item.label : undefined}
      className={cn(
        "group flex flex-col items-center justify-center gap-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        layout === "rail" ? "h-16 w-16 rounded-2xl" : "h-16",
        active ? "text-(--accent)" : "text-(--text-muted) hover:text-(--text-strong)",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200 group-active:scale-95",
          active && "bg-(--accent-soft)",
        )}
      >
        <Icon aria-hidden="true" size={22} strokeWidth={active ? 2.4 : 2} />
      </span>
      <span className={cn("text-[11px]", active ? "font-semibold" : "font-medium")}>
        {item.label}
      </span>
    </NavLink>
  );
}
