
import { createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  // Define um usuário admin padrão durante o desenvolvimento
  user: {
    id: "dev-admin",
    email: "admin@example.com",
    role: "admin"
  },
  isAdmin: true
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = {
    user: {
      id: "dev-admin",
      email: "admin@example.com",
      role: "admin"
    },
    isAdmin: true
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
