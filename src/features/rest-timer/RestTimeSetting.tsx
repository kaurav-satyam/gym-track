import { SegmentedControl } from "@/shared/ui";
import { REST_OPTIONS, setRestSeconds, useRestSeconds } from "./restTimer";

const OPTIONS = REST_OPTIONS.map((seconds) => ({
  value: String(seconds),
  label: seconds === 0 ? "Off" : seconds < 120 ? `${seconds}s` : `${seconds / 60}m`,
}));

/** Rest duration picker for the Settings screen. */
export default function RestTimeSetting() {
  const seconds = useRestSeconds();

  return (
    <SegmentedControl
      className="w-full"
      options={OPTIONS}
      value={String(seconds)}
      onChange={(value) => setRestSeconds(Number(value))}
    />
  );
}
