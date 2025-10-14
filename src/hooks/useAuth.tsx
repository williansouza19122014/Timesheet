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
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const defaultContext: AuthContextType = {
  user: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
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
      applyUser(response.user);
    } catch (error) {
      console.error("Failed to refresh authenticated user", error);
      clearAuth();
      applyUser(null);
    }
  }, [applyUser]);

  useEffect(() => {
    const storedUserRaw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (storedUserRaw && getStoredToken()) {
      try {
        const parsed = JSON.parse(storedUserRaw) as AuthUser;
        applyUser(parsed);
      } catch {
        clearAuth();
      }
    }

    refreshUser().finally(() => setLoading(false));
  }, [applyUser, refreshUser]);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const result = await loginRequest(credentials);
      saveAuth(result.token, result.user);
      applyUser(result.user);
    },
    [applyUser]
  );

  const register = useCallback(
    async (payload: { name: string; email: string; password: string }) => {
      await registerRequest({
        name: payload.name,
        email: payload.email,
        password: payload.password,
      });
    },
    []
  );

  const logout = useCallback(() => {
    clearAuth();
    applyUser(null);
  }, [applyUser]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "ADMIN",
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
