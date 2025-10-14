import { Routes, Route } from "react-router-dom";

// Import das páginas
import Layout from "./components/Layout";
import PrivateRoute from "./components/auth/PrivateRoute";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ApprovalRequests from "./pages/ApprovalRequests";
import Clients from "./pages/Clients";
import EmployeeRegistration from "./pages/EmployeeRegistration";
import Index from "./pages/Index";
import Kanban from "./pages/Kanban";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Team from "./pages/Team";
import TimeSheet from "./pages/TimeSheet";
import TimeTracking from "./pages/TimeTracking";
import Users from "./pages/Users";
import Vacations from "./pages/Vacations";

function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />

      {/* Rotas protegidas dentro do Layout */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="approval-requests" element={<ApprovalRequests />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="cadastro-colaborador" element={<EmployeeRegistration />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="relatorios" element={<Reports />} />
          <Route path="configuracoes" element={<Settings />} />
          <Route path="team" element={<Team />} />
          <Route path="ponto" element={<TimeSheet />} />
          <Route path="timetracking" element={<TimeTracking />} />
          <Route path="users" element={<Users />} />
          <Route path="ferias" element={<Vacations />} />
        </Route>
      </Route>

      {/* Rota para páginas inexistentes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
