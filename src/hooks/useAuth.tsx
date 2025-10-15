import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Role, useAccessControl } from "@/context/access-control-context";
import {
  type AuthUser,
  type AuthRole,
  fetchProfile,
  login as loginRequest,
  register as registerRequest,
} from "@/lib/auth-api";

const TOKEN_STORAGE_KEY = "auth_token";
const USER_STORAGE_KEY = "auth_user";

type AuthContextType = {
  user: (AuthUser & { roleLabel: Role }) | null;
  token: string | null;
  tenantId: string | null;
  permissions: string[];
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMaster: boolean;
  hasPermission: (permission: string) => boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const defaultContext: AuthContextType = {
  user: null,
  token: null,
  tenantId: null,
  permissions: [],
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isMaster: false,
  hasPermission: () => false,
  login: async () => undefined,
  register: async () => undefined,
  logout: () => undefined,
  refreshUser: async () => undefined,
};

const AuthContext = createContext<AuthContextType>(defaultContext);

const mapRole = (role: AuthRole): Role => {
  switch (role) {
    case "ADMIN":
      return "admin";
    case "MANAGER":
      return "leader";
    default:
      return "user";
  }
};

const toStoredUser = (user: AuthUser) => ({
  ...user,
  roleLabel: mapRole(user.role),
});

const saveAuth = (token: string, user: AuthUser) => {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const clearAuth = () => {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
};

const getStoredToken = () => window.localStorage.getItem(TOKEN_STORAGE_KEY);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setActiveRole } = useAccessControl();
  const [user, setUser] = useState<(AuthUser & { roleLabel: Role }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const applyUser = useCallback(
    (nextUser: AuthUser | null) => {
      if (nextUser) {
        const normalized = toStoredUser(nextUser);
        setUser(normalized);
        setActiveRole(normalized.roleLabel);
      } else {
        setUser(null);
        setActiveRole("user");
      }
    },
    [setActiveRole]
  );

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      applyUser(null);
      return;
    }

    try {
      const response = await fetchProfile();
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
      applyUser(response.user);
    } catch (error) {
      console.error("Failed to refresh authenticated user", error);
      clearAuth();
      setToken(null);
      applyUser(null);
    }
  }, [applyUser]);

  useEffect(() => {
    const storedUserRaw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (storedUserRaw && getStoredToken()) {
      try {
        const parsed = JSON.parse(storedUserRaw) as AuthUser;
        applyUser(parsed);
        setToken(getStoredToken());
      } catch {
        clearAuth();
        setToken(null);
      }
    }

    refreshUser().finally(() => setLoading(false));
  }, [applyUser, refreshUser]);

  const persistAuth = useCallback(
    (nextToken: string, nextUser: AuthUser) => {
      saveAuth(nextToken, nextUser);
      setToken(nextToken);
      applyUser(nextUser);
    },
    [applyUser]
  );

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const result = await loginRequest(credentials);
      persistAuth(result.token, result.user);
    },
    [persistAuth]
  );

  const register = useCallback(
    async (payload: { name: string; email: string; password: string }) => {
      const result = await registerRequest({
        name: payload.name,
        email: payload.email,
        password: payload.password,
      });
      persistAuth(result.token, result.user);
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    applyUser(null);
  }, [applyUser]);

  const permissions = user?.permissions ?? [];

  const hasPermission = useCallback(
    (permission: string) => {
      if (!permission) return false;
      if (!permissions.length) return false;
      if (permissions.includes("*")) return true;
      return permissions.includes(permission);
    },
    [permissions]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      tenantId: user?.tenantId ?? null,
      permissions,
      loading,
      isAuthenticated: Boolean(user && token),
      isAdmin: hasPermission("*") || user?.role === "ADMIN",
      isMaster: Boolean(user?.isMaster || hasPermission("*")),
      hasPermission,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, permissions, loading, hasPermission, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
