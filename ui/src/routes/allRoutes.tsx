import { ReactNode } from "react";
import DashboardsPage from "@pages/dashboards/ecommerce";
import SignInBasicPage from "@pages/auth/signinBasic";

interface IRoute {
  path: string;
  component: ReactNode;
}

const routes: IRoute[] = [
  { path: "/", component: <DashboardsPage /> },
  { path: "/dashboards/ecommerce", component: <DashboardsPage /> },
];

const nonAuthRoutes: IRoute[] = [
  { path: "/auth/signin-basic", component: <SignInBasicPage /> },
];

export { routes, nonAuthRoutes };
