import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAccessControl } from "@/context/access-control-context";

const PrivateRoute = () => {
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const { canAccess, features } = useAccessControl();

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
  if (feature && !canAccess(feature.key)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-destructive">Acesso negado</h1>
          <p className="text-sm text-muted-foreground">
            Peça a um administrador para revisar suas permissões.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
