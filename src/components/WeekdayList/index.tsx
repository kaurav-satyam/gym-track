import { useNavigate } from "react-router";
import { WEEKDAYS } from "../../data/weekday.data";
import WeekdayCard from "./WeekdayCard";

export default function WeekdayList() {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {WEEKDAYS.map((day) => (
        <WeekdayCard
          key={day}
          day={day}
          workoutType="push"
          progress={10}
          onClick={() => navigate(`/dayscreen/${day}`)}
        />
      ))}
    </div>
  );
}
