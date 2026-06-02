import { createBrowserRouter } from "react-router";
import ExerciseHistoryScreen from "../features/exercise-history/screens/ExerciseHistoryScreen";
import WorkoutDayScreen from "../features/exercises/screens/WorkoutDayScreen";
import WeekPlanScreen from "../features/week-plan/screens/WeekPlanScreen";
import AppLayout from "./AppLayout";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <WeekPlanScreen /> },
      { path: "days/:day", element: <WorkoutDayScreen /> },
      {
        path: "exercises/:exerciseId/history",
        element: <ExerciseHistoryScreen />,
      },
    ],
  },
]);

export default AppRouter;
