import { createBrowserRouter, Navigate } from "react-router";
import ExerciseDetailScreen from "../features/exercise-detail/screens/ExerciseDetailScreen";
import AddExerciseScreen from "../features/exercises/screens/AddExerciseScreen";
import WorkoutDayScreen from "../features/exercises/screens/WorkoutDayScreen";
import ProgressScreen from "../features/progress/screens/ProgressScreen";
import SettingsScreen from "../features/settings/screens/SettingsScreen";
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
      { path: "days/:day", element: <WorkoutDayScreen /> },
      { path: "days/:day/add-exercise", element: <AddExerciseScreen /> },
      { path: "progress", element: <ProgressScreen /> },
      // Retired routes: the week view lives in the day strip, analytics is Progress.
      { path: "week", element: <Navigate to="/" replace /> },
      { path: "analytics", element: <Navigate to="/progress" replace /> },
      { path: "settings", element: <SettingsScreen /> },
      { path: "exercises/:exerciseId", element: <ExerciseDetailScreen /> },
      // Old history URL now lives on the detail page.
      {
        path: "exercises/:exerciseId/history",
        element: <Navigate to=".." relative="path" replace />,
      },
    ],
  },
]);

export default AppRouter;
