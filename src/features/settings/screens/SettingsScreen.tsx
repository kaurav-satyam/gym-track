import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import {
  getStoredThemePreference,
  persistThemePreference,
  type ThemePreference,
} from "../../../app/theme";
import { AppLogo, PageShell, Panel, SegmentedControl, cn } from "../../../shared/ui";

const themeOptions: { label: string; value: ThemePreference }[] = [
  { label: "System", value: "system" },
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
];

export default function SettingsScreen() {
  const [themePreference, setThemePreference] = useState<ThemePreference>(
    getStoredThemePreference,
  );

  function handleThemePreferenceChange(nextPreference: ThemePreference) {
    setThemePreference(nextPreference);
    persistThemePreference(nextPreference);
  }

  return (
    <PageShell
      eyebrow="Settings"
      title="Preferences"
      description="Choose how GymTrack should look on this device."
    >
      <Panel className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <AppLogo size="md" className="hidden sm:inline-flex" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ThemeIcon preference={themePreference} />
                Theme
              </div>
              <p className="max-w-xl text-sm leading-6 text-(--text-muted)">
                System follows your device. Dark and light stay fixed until you
                change them.
              </p>
            </div>
          </div>

          <SegmentedControl
            className="w-full sm:w-[340px]"
            options={themeOptions}
            value={themePreference}
            onChange={handleThemePreferenceChange}
          />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <ThemePreview label="System" active={themePreference === "system"} />
          <ThemePreview label="Dark" active={themePreference === "dark"} tone="dark" />
          <ThemePreview label="Light" active={themePreference === "light"} tone="light" />
        </div>
      </Panel>
    </PageShell>
  );
}

function ThemePreview({
  label,
  active,
  tone = "system",
}: {
  label: string;
  active: boolean;
  tone?: "system" | "dark" | "light";
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border p-3 transition duration-200",
        active
          ? "border-(--accent-border) bg-(--accent-soft)"
          : "border-(--surface-border) bg-(--surface-control)",
      )}
    >
      {active && (
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-(--accent) text-(--accent-ink)">
          <Check size={13} />
        </span>
      )}
      <div
        className={cn(
          "h-16 overflow-hidden rounded-xl border",
          tone === "light"
            ? "border-slate-200 bg-[#f7f9f2]"
            : tone === "dark"
              ? "border-slate-700 bg-[#050816]"
              : "border-(--surface-border) bg-linear-to-br from-[#050816] via-[#eef4ff] to-[#f7f9f2]",
        )}
      >
        <div className="m-2 h-3 w-14 rounded-full bg-[#4b5716]" />
        <div className="mx-2 mt-5 h-2 w-20 rounded-full bg-slate-400/45" />
        <div className="mx-2 mt-2 h-2 w-12 rounded-full bg-slate-400/25" />
      </div>
      <p className="mt-2 text-xs font-medium text-(--text-soft)">{label}</p>
    </div>
  );
}

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === "light") {
    return <Sun className="text-(--accent)" size={18} />;
  }

  if (preference === "dark") {
    return <Moon className="text-(--accent)" size={18} />;
  }

  return <Monitor className="text-(--text-soft)" size={18} />;
}
