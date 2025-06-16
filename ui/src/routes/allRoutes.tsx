import { ReactNode } from "react";
import DashboardsPage from "@pages/dashboards/ecommerce";
import SignInBasic from "@views/auth/signIn/signinBasic";
import ProtectedRoute from "../components/ProtectedRoute";

interface IRoute {
  path: string;
  component: ReactNode;
}

const routes: IRoute[] = [
  { 
    path: "/", 
    component: (
      <ProtectedRoute>
        <DashboardsPage />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/dashboards/ecommerce", 
    component: (
      <ProtectedRoute>
        <DashboardsPage />
      </ProtectedRoute>
    ) 
  },
];

const nonAuthRoutes: IRoute[] = [
  { path: "/login", component: <SignInBasic /> },
];

export { routes, nonAuthRoutes };
