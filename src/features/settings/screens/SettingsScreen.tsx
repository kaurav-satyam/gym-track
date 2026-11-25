import { useState } from "react";
import {
  getStoredThemePreference,
  persistThemePreference,
  type ThemePreference,
} from "@/app/theme";
import { RestTimeSetting } from "@/features/rest-timer";
import { AppLogo, Card, ScreenHeader, SectionTitle, SegmentedControl } from "@/shared/ui";
import BackupSection from "../components/BackupSection";

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
    <section className="motion-page mx-auto w-full max-w-xl space-y-6 px-4 pb-10 pt-4">
      <ScreenHeader eyebrow="Preferences" title="Settings" />

      <section>
        <SectionTitle>Appearance</SectionTitle>
        <Card className="space-y-3 p-4">
          <div>
            <p className="font-semibold text-(--text-strong)">Theme</p>
            <p className="text-sm text-(--text-muted)">System follows your device setting.</p>
          </div>
          <SegmentedControl
            className="w-full"
            options={themeOptions}
            value={themePreference}
            onChange={handleThemeChange}
          />
        </Card>
      </section>

      <section>
        <SectionTitle>Workout</SectionTitle>
        <Card className="space-y-3 p-4">
          <div>
            <p className="font-semibold text-(--text-strong)">Rest timer</p>
            <p className="text-sm text-(--text-muted)">
              Starts after every logged set and buzzes when it's time to go again.
            </p>
          </div>
          <RestTimeSetting />
        </Card>
      </section>

      <section>
        <SectionTitle>Your data</SectionTitle>
        <BackupSection />
      </section>

      <section>
        <SectionTitle>About</SectionTitle>
        <Card className="flex items-center gap-4 p-4">
          <AppLogo size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-(--text-strong)">GymTrack</p>
            <p className="text-sm text-(--text-muted)">
              Simple, offline workout tracking.
            </p>
          </div>
        </Card>
      </section>
    </section>
  );
}
