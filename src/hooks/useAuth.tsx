
import { createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: {
    id: "willian-admin-id",
    email: "willian.souza@exemplo.com",
    name: "Willian Souza",
    role: "admin"
  },
  isAdmin: true
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Durante o desenvolvimento, vamos simular o Willian como admin
  const value = {
    user: {
      id: "willian-admin-id",
      email: "willian.souza@exemplo.com",
      name: "Willian Souza",
      role: "admin"
    },
    isAdmin: true
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
