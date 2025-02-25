
import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Clock, ChartBar, User, Users, Settings, LogOut, Building2, Home, Users as UsersIcon, ClipboardList, BarChart, LayoutIcon, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Inbox from "./notifications/Inbox";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { toast } = useToast();

  const navigationItems = [
    { icon: Home, label: "Início", route: "/" },
    { icon: FileText, label: "TimeSheet", route: "/timesheet" },
    { icon: UsersIcon, label: "Equipe", route: "/team" },
    { icon: Clock, label: "Horas", route: "/time-tracking" },
    { icon: ClipboardList, label: "Clientes", route: "/clients" },
    { icon: BarChart, label: "Relatórios", route: "/reports" },
    { icon: LayoutIcon, label: "Kanban", route: "/kanban" },
    { icon: Settings, label: "Configurações", route: "/settings" },
  ];

  const handleSignOut = async () => {
    try {
      toast({
        description: "Logout realizado com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: "Por favor, tente novamente",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white border-r transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="h-full px-3 py-4 flex flex-col">
          <div className="mb-10 flex items-center justify-between">
            <span
              className={`font-semibold text-xl ${!isSidebarOpen && "hidden"}`}
            >
              TimeTrack
            </span>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-smooth"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isSidebarOpen ? "M11 19l-7-7 7-7" : "M13 5l7 7-7 7"}
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.route;
              return (
                <Link
                  key={item.label}
                  to={item.route}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth ${
                    isActive
                      ? "bg-accent text-white"
                      : "hover:bg-muted text-secondary hover:text-primary"
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className={!isSidebarOpen ? "hidden" : ""}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-6 h-6" />
            <span className={!isSidebarOpen ? "hidden" : ""}>Sair</span>
          </button>
        </div>
      </aside>

      <main
        className={`min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <div className="container py-8">
          <div className="absolute top-4 right-8">
            <Inbox />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
