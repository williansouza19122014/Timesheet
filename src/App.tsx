
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import Settings from "@/pages/Settings";
import TimeTracking from "@/pages/TimeTracking";
import Users from "@/pages/Users";
import Kanban from "@/pages/Kanban";
import Clients from "@/pages/Clients";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";
import Vacations from "@/pages/Vacations";
import PrivateRoute from "@/components/auth/PrivateRoute";
import EmployeeRegistration from "@/pages/EmployeeRegistration";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/ponto" element={<TimeTracking />} />
            <Route path="/ferias" element={<Vacations />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/cadastro-colaborador" element={<EmployeeRegistration />} />
            <Route path="/usuarios" element={<Users />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/perfil" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
