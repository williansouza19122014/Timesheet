
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import TimeTracking from "@/pages/TimeTracking";
import Clients from "@/pages/Clients";
import Team from "@/pages/Team";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/NotFound";
import Kanban from "@/pages/Kanban";
import ApprovalRequests from "@/pages/ApprovalRequests";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="configuracoes" element={<Settings />} />
          <Route path="ponto" element={<TimeTracking />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="equipe" element={<Team />} />
          <Route path="relatorios" element={<Reports />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="aprovacoes" element={<ApprovalRequests />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
