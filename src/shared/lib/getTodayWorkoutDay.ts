import { WEEKDAYS } from "../constants/weekdays";

export default function getTodayWorkoutDay() {
  return WEEKDAYS[new Date().getDay()];
}
