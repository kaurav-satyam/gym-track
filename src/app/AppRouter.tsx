import { createBrowserRouter, Navigate } from "react-router";
import TodayAnalyticsScreen from "../features/analytics/screens/TodayAnalyticsScreen";
import ExerciseHistoryScreen from "../features/exercise-history/screens/ExerciseHistoryScreen";
import WorkoutDayScreen from "../features/exercises/screens/WorkoutDayScreen";
import SettingsScreen from "../features/settings/screens/SettingsScreen";
import WeekPlanScreen from "../features/week-plan/screens/WeekPlanScreen";
import getTodayWorkoutDay from "../shared/lib/getTodayWorkoutDay";
import AppLayout from "./AppLayout";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={"/days/" + getTodayWorkoutDay()} replace />,
      },
      { path: "week", element: <WeekPlanScreen /> },
      { path: "days/:day", element: <WorkoutDayScreen /> },
      { path: "analytics", element: <TodayAnalyticsScreen /> },
      { path: "settings", element: <SettingsScreen /> },
      {
        path: "exercises/:exerciseId/history",
        element: <ExerciseHistoryScreen />,
      },
    ],
  },
]);

export default AppRouter;
