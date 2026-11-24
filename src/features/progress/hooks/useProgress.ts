import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { getProgressSummary } from "@/data/repositories/progress.repository";
import { isCurrentRange, shiftAnchorDate, type ProgressPeriod } from "@/domain/progress";

/** Period/range navigation plus the live summary for the Progress tab. */
export function useProgress() {
  const [period, setPeriod] = useState<ProgressPeriod>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const summary = useLiveQuery(
    () => getProgressSummary(period, anchorDate),
    [period, anchorDate],
  );

  return {
    period,
    setPeriod,
    summary,
    isCurrent: isCurrentRange(period, anchorDate),
    showPrevious: () => setAnchorDate(shiftAnchorDate(anchorDate, period, -1)),
    showNext: () => setAnchorDate(shiftAnchorDate(anchorDate, period, 1)),
    showCurrent: () => setAnchorDate(new Date()),
  };
}
