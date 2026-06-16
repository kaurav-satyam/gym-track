import {
  Activity,
  CalendarDays,
  Dumbbell,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { NavLink, useLocation } from "react-router";
import getTodayWorkoutDay from "../shared/lib/getTodayWorkoutDay";
import { AppLogo, cn } from "../shared/ui";

interface INavigationItem {
  label: string;
  icon: LucideIcon;
  to?: string;
  isActive: (pathname: string) => boolean;
}

function DesktopNavigationItem({
  item,
  isActive,
}: {
  item: INavigationItem;
  isActive: boolean;
}) {
  const Icon = item.icon;
  const className = cn(
    "group/nav relative flex h-12 w-12 items-center justify-center border transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
    isActive
      ? "rounded-2xl border-(--accent-border) bg-(--nav-active-bg) text-(--nav-active-fg) shadow-[0_14px_34px_rgba(2,6,23,0.22)]"
      : "rounded-[24px] border-(--nav-border) bg-(--nav-item-bg) text-(--nav-item-fg) hover:rounded-2xl hover:border-(--surface-border-strong) hover:bg-(--nav-item-hover-bg) hover:text-(--nav-item-hover-fg)",
  );

  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "absolute -left-3 rounded-r-full bg-(--accent) transition-all duration-200",
          isActive
            ? "h-8 w-1 opacity-100"
            : "h-2 w-1 opacity-0 group-hover/nav:h-5 group-hover/nav:opacity-80",
        )}
      />
      <Icon aria-hidden="true" size={22} strokeWidth={2.2} />
      <span className="sr-only">{item.label}</span>
      <span className="pointer-events-none absolute left-14 z-50 rounded-md border border-(--surface-border) bg-(--tooltip-bg) px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition duration-150 group-hover/nav:translate-x-1 group-hover/nav:opacity-100">
        {item.label}
      </span>
    </>
  );

  if (item.to) {
    return (
      <NavLink aria-label={item.label} className={className} to={item.to}>
        {content}
      </NavLink>
    );
  }

  return (
    <button
      aria-disabled="true"
      aria-label={item.label}
      className={className}
      type="button"
    >
      {content}
    </button>
  );
}

function MobileNavigationItem({
  item,
  isActive,
}: {
  item: INavigationItem;
  isActive: boolean;
}) {
  const Icon = item.icon;
  const className = cn(
    "relative flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border px-1 transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
    isActive
      ? "border-(--accent-border) bg-(--nav-active-bg) text-(--nav-active-fg)"
      : "border-(--nav-border) bg-(--nav-item-bg) text-(--nav-item-fg) active:bg-(--nav-item-hover-bg)",
  );

  const content = (
    <>
      <Icon aria-hidden="true" size={20} strokeWidth={2.25} />
      <span className="max-w-full truncate text-[10px] font-semibold leading-none">
        {item.label}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1 h-1 rounded-full bg-current transition-all duration-200",
          isActive ? "w-5 opacity-100" : "w-1 opacity-30",
        )}
      />
    </>
  );

  if (item.to) {
    return (
      <NavLink aria-label={item.label} className={className} to={item.to}>
        {content}
      </NavLink>
    );
  }

  return (
    <button
      aria-disabled="true"
      aria-label={item.label}
      className={className}
      type="button"
    >
      {content}
    </button>
  );
}

export default function AppNavigation() {
  const { pathname } = useLocation();
  const todayWorkoutPath = "/days/" + getTodayWorkoutDay();
  const navigationItems: INavigationItem[] = [
    {
      label: "Today",
      icon: Dumbbell,
      to: todayWorkoutPath,
      isActive: (currentPathname) => currentPathname.startsWith("/days/"),
    },
    {
      label: "Week",
      icon: CalendarDays,
      to: "/week",
      isActive: (currentPathname) => currentPathname === "/week",
    },
    {
      label: "Analytics",
      icon: Activity,
      to: "/analytics",
      isActive: (currentPathname) =>
        currentPathname === "/analytics" ||
        currentPathname.startsWith("/exercises/"),
    },
    {
      label: "Settings",
      icon: Settings,
      to: "/settings",
      isActive: (currentPathname) => currentPathname === "/settings",
    },
  ];

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className="fixed inset-y-0 left-0 z-40 hidden w-21 flex-col items-center border-r border-(--nav-border) bg-(--nav-bg) px-3 py-4 shadow-[16px_0_42px_rgba(2,6,23,0.18)] backdrop-blur-xl md:flex"
      >
        <NavLink
          aria-label="GymTrack home"
          className="group/nav rounded-[18px] transition duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          to={todayWorkoutPath}
        >
          <AppLogo size="lg" className="border-(--accent-border)" />
        </NavLink>

        <div className="my-4 h-px w-8 bg-(--surface-border)" />

        <div className="flex flex-1 flex-col items-center gap-3">
          {navigationItems.map((item) => (
            <DesktopNavigationItem
              key={item.label}
              isActive={item.isActive(pathname)}
              item={item}
            />
          ))}
        </div>
      </nav>

      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-(--nav-border) bg-(--nav-bg) px-3 pt-2.5 shadow-[0_-18px_42px_rgba(2,6,23,0.22)] backdrop-blur-xl md:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-2 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          {navigationItems.map((item) => (
            <MobileNavigationItem
              key={item.label}
              isActive={item.isActive(pathname)}
              item={item}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
