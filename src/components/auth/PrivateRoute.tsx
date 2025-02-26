
import { useEffect, useState } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

const PrivateRoute = () => {
  // Durante o desenvolvimento, sempre retorna como autenticado
  const authenticated = true;

  // Remove verificação do Supabase temporariamente
  return <Outlet />;
};

export default PrivateRoute;
