import { ReactNode } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "../views/dashboard/Dashboard";
import Audits from "../views/audits/Audits";
import AuditDetails from "../views/audits/AuditDetails";
import CreateAudit from "../views/audits/CreateAudit";
import EditAudit from "../views/audits/EditAudit";
import Admins from "../views/admins/Admins";
import Users from "../views/admins/Users";
import WorkflowList from "../views/admins/WorkflowList";
import WorkflowDesigner from "../views/admins/WorkflowDesigner";
import RolesPermissions from "../views/admins/RolesPermissions";
import AddRole from "../views/admins/AddRole";
import EditRole from "../views/admins/EditRole";
import FAQ from "../views/faq/FAQ";
import Entities from "../views/entities/Entities";
import TemplateManager from "../views/checklists/TemplateManager";
import CreateTemplate from "../views/checklists/CreateTemplate";
import EditTemplate from "../views/checklists/EditTemplate";
import ViewTemplate from "../views/checklists/ViewTemplate";
import ChecklistFilling from "../views/audits/ChecklistFilling";
import AuditReport from "../views/audits/AuditReport";
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
    path: "/audits/new", 
    component: (
      <ProtectedRoute>
        <CreateAudit />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/audits/:id/edit", 
    component: (
      <ProtectedRoute>
        <EditAudit />
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
    path: "/admins/users", 
    component: (
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/admins/roles-permissions", 
    component: (
      <ProtectedRoute>
        <RolesPermissions />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/admins/roles-permissions/add", 
    component: (
      <ProtectedRoute>
        <AddRole />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/admins/roles-permissions/edit/:id", 
    component: (
      <ProtectedRoute>
        <EditRole />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/admins/workflows", 
    component: (
      <ProtectedRoute>
        <WorkflowList />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/admins/workflows/designer", 
    component: (
      <ProtectedRoute>
        <WorkflowDesigner />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/admins/workflows/designer/:id", 
    component: (
      <ProtectedRoute>
        <WorkflowDesigner />
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
  { 
    path: "/templates", 
    component: (
      <ProtectedRoute>
        <TemplateManager />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/templates/create", 
    component: (
      <ProtectedRoute>
        <CreateTemplate />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/templates/:id", 
    component: (
      <ProtectedRoute>
        <ViewTemplate />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/templates/:id/edit", 
    component: (
      <ProtectedRoute>
        <EditTemplate />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/audit-tasks/:taskId/fill", 
    component: (
      <ProtectedRoute>
        <ChecklistFilling />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/audits/:id/report", 
    component: (
      <ProtectedRoute>
        <AuditReport />
      </ProtectedRoute>
    ) 
  },
];

const nonAuthRoutes: IRoute[] = [
  { path: "*", component: <NotFound /> }
];

export { routes, nonAuthRoutes };
