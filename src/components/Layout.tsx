
import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Clock, ChartBar, User, Users, Settings, LogOut, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { toast } = useToast();

  const navigation = [
    { name: "Time Tracking", href: "/", icon: Clock },
    { name: "Clientes e Projetos", href: "/clients", icon: Building2 },
    { name: "Reports", href: "/reports", icon: ChartBar },
    { name: "Team", href: "/team", icon: Users },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
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
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth ${
                    isActive
                      ? "bg-accent text-white"
                      : "hover:bg-muted text-secondary hover:text-primary"
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className={!isSidebarOpen ? "hidden" : ""}>
                    {item.name}
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
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
