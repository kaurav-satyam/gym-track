import { createBrowserRouter } from "react-router";
import DayScreen from "../pages/DayScreen";
import Home from "../pages/Home";
import LogScreen from "../pages/LogScreen";
import AppLayout from "./AppLayout";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "dayscreen/:day", element: <DayScreen /> },
      { path: "logscreen/:excid", element: <LogScreen /> },
    ],
  },
]);

export default AppRouter;
