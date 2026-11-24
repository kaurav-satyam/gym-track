import { useState } from "react";
import {
  getStoredThemePreference,
  persistThemePreference,
  type ThemePreference,
} from "../../../app/theme";
import { SegmentedControl } from "../../../shared/ui";

const themeOptions: { label: string; value: ThemePreference }[] = [
  { label: "System", value: "system" },
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
];

export default function SettingsScreen() {
  const [themePreference, setThemePreference] = useState<ThemePreference>(
    getStoredThemePreference,
  );

  function handleThemeChange(nextPreference: ThemePreference) {
    setThemePreference(nextPreference);
    persistThemePreference(nextPreference);
  }

  return (
    <section className="motion-page mx-auto w-full max-w-xl space-y-7 px-4 pb-10 pt-5">
      <h1 className="text-3xl font-semibold tracking-tight text-(--text-strong)">Settings</h1>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-(--text-strong)">Theme</p>
          <p className="text-sm text-(--text-muted)">System follows your device.</p>
        </div>
        <SegmentedControl
          options={themeOptions}
          value={themePreference}
          onChange={handleThemeChange}
        />
      </div>
    </section>
  );
}
