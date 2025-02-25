
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  // Durante o desenvolvimento, sempre retorna como autenticado
  const authenticated = true;

  // Remove verificação do Supabase temporariamente
  return children;
};

export default PrivateRoute;
