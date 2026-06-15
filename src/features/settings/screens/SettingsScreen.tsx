import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import {
  getStoredThemePreference,
  persistThemePreference,
  type ThemePreference,
} from "../../../app/theme";
import { PageShell, Panel, SegmentedControl } from "../../../shared/ui";

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

          <SegmentedControl
            className="w-full sm:w-85"
            options={themeOptions}
            value={themePreference}
            onChange={handleThemePreferenceChange}
          />
        </div>
      </Panel>
    </PageShell>
  );
}

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === "light") {
    return <Sun className="text-amber-300" size={18} />;
  }

  if (preference === "dark") {
    return <Moon className="text-sky-200" size={18} />;
  }

  return <Monitor className="text-(--text-soft)" size={18} />;
}
