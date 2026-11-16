import { ui } from "../styles/ui";
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import Dashboard from "../pages/Dashboard";
import Settings from "../pages/Settings";
import LearningGuide from "../features/learning/LearningGuide";
const PCBuilder = lazy(() => import("../features/pc-builder/pages/PCBuilder"));
const NetworkLab = lazy(
  () => import("../features/network-lab/pages/NetworkLab"),
);
const loading = (
  <div className={ui("empty-state")}>Preparing your workspace…</div>
);
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Dashboard /> },
      {
        path: "/pc-builder",
        element: (
          <Suspense fallback={loading}>
            <PCBuilder />
          </Suspense>
        ),
      },
      {
        path: "/network-lab",
        element: (
          <Suspense fallback={loading}>
            <NetworkLab />
          </Suspense>
        ),
      },
      { path: "/guide", element: <LearningGuide /> },
      { path: "/settings", element: <Settings /> },
      {
        path: "*",
        element: (
          <div className={ui("page")}>
            <h1>Workspace not found</h1>
            <a href="/">Return to dashboard</a>
          </div>
        ),
      },
    ],
  },
]);
