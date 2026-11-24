import { Navigate } from "react-router";
import { getTodayWorkoutDay } from "@/domain/weekdays";

/** "/" → today's day. Evaluated per visit (not at module load) so it's right after midnight. */
export default function TodayRedirect() {
  return <Navigate to={`/days/${getTodayWorkoutDay()}`} replace />;
}
