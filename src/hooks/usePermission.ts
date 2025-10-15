import { useMemo } from "react";
import { useAuth } from "./useAuth";

export const usePermission = (permission?: string) => {
  const { hasPermission, permissions, user } = useAuth();

  const isAllowed = useMemo(() => {
    if (!permission) {
      return false;
    }
    return hasPermission(permission);
  }, [hasPermission, permission]);

  return {
    hasPermission,
    permissions,
    isAllowed,
    isMaster: Boolean(user?.isMaster),
  };
};
