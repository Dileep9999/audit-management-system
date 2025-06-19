import { ReactNode } from "react";
import SignInBasic from "../views/auth/signIn/signinBasic";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "../views/dashboard/Dashboard";
import Audits from "../views/audits/Audits";
import AuditDetails from "../views/audits/AuditDetails";
import Admins from "../views/admins/Admins";
import FAQ from "../views/faq/FAQ";
import Entities from "../views/entities/Entities";
import NotFound from "../components/NotFound";

interface IRoute {
  path: string;
  component: ReactNode;
}

const routes: IRoute[] = [
  { 
    path: "/", 
    component: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/dashboard", 
    component: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/audits", 
    component: (
      <ProtectedRoute>
        <Audits />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/audits/:id", 
    component: (
      <ProtectedRoute>
        <AuditDetails />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/admins", 
    component: (
      <ProtectedRoute>
        <Admins />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/faq", 
    component: (
      <ProtectedRoute>
        <FAQ />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/entities", 
    component: (
      <ProtectedRoute>
        <Entities />
      </ProtectedRoute>
    ) 
  },
];

const nonAuthRoutes: IRoute[] = [
  { path: "/login", component: <SignInBasic /> },
  { path: "*", component: <NotFound /> }
];

export { routes, nonAuthRoutes };
