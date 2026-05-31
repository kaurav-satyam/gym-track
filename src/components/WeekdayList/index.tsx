import { useNavigate } from "react-router";
import { WEEKDAYS } from "../../data/weekday.data";
import WeekdayCard from "./WeekdayCard";

export default function WeekdayList() {
  const navigate = useNavigate();

  function weekdayClick(e: React.MouseEvent<HTMLDivElement>) {
    const day = e.currentTarget.dataset.day;
    console.log(day);
    navigate(`/dayscreen/${day}`);
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      {WEEKDAYS.map((day) => (
        <WeekdayCard
          key={day}
          day={day}
          workoutType="push"
          progress={10}
          onClick={weekdayClick}
        />
      ))}
    </div>
  );
}
