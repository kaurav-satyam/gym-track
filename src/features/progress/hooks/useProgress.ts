import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { getProgressSummary } from "@/data/repositories/progress.repository";
import { isCurrentWeek, shiftWeek } from "@/domain/progress";

/** Week navigation plus the live summary for the Progress tab. */
export function useProgress() {
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const summary = useLiveQuery(() => getProgressSummary(anchorDate), [anchorDate]);

  return {
    summary,
    isCurrent: isCurrentWeek(anchorDate),
    showPrevious: () => setAnchorDate(shiftWeek(anchorDate, -1)),
    showNext: () => setAnchorDate(shiftWeek(anchorDate, 1)),
    showCurrent: () => setAnchorDate(new Date()),
  };
}
