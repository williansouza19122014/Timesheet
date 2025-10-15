import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAccessControl, type FeatureKey } from "@/context/access-control-context";
import { usePermission } from "@/hooks/usePermission";
import Forbidden from "./Forbidden";

const FEATURE_PERMISSION_MAP: Partial<Record<FeatureKey, string>> = {
  clients: "clients.view",
  reports: "reports.view",
  users: "users.list",
  settings: "tenant.manage",
  team: "projects.members.manage",
  timesheet: "projects.view",
  vacations: "vacations.view",
};

const ROUTE_PERMISSIONS: Record<string, string> = {
  "/clientes": "clients.view",
  "/relatorios": "reports.view",
  "/users": "users.list",
  "/admin/users": "users.list",
  "/admin/roles": "roles.list",
  "/admin/tenant": "tenant.manage",
};

const PrivateRoute = () => {
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const { canAccess, features } = useAccessControl();
  const { hasPermission, isMaster } = usePermission();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const feature = features.find((item) => item.path === location.pathname);
  const featurePermission = feature?.key ? FEATURE_PERMISSION_MAP[feature.key] : undefined;
  const explicitPermission = Object.entries(ROUTE_PERMISSIONS).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1];

  if (feature && !canAccess(feature.key)) {
    return <Forbidden />;
  }

  const requiredPermission = explicitPermission ?? featurePermission;
  if (requiredPermission && !hasPermission(requiredPermission) && !isMaster) {
    return <Forbidden />;
  }

  return <Outlet />;
};

export default PrivateRoute;
