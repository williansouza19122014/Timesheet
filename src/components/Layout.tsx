
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  Building2,
  FileBarChart,
  Settings,
  UserCircle,
  Bell,
  KanbanSquare,
  Menu,
  Users,
  Calendar,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Inbox from "./notifications/Inbox";
import { Button } from "./ui/button";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Ponto",
      href: "/ponto",
      icon: Clock,
    },
    {
      name: "Férias",
      href: "/ferias",
      icon: Calendar,
    },
    {
      name: "Kanban",
      href: "/kanban",
      icon: KanbanSquare,
    },
    {
      name: "Clientes",
      href: "/clientes",
      icon: Building2,
    },
    {
      name: "Colaboradores",
      href: "/cadastro-colaborador",
      icon: Users,
    },
    {
      name: "Relatórios",
      href: "/relatorios",
      icon: FileBarChart,
    },
  ];

  const secondaryNavigation = [
    {
      name: "Configurações",
      href: "/configuracoes",
      icon: Settings,
    },
    {
      name: "Perfil",
      href: "/perfil",
      icon: UserCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 z-50 flex flex-col transition-all duration-300 ease-in-out bg-white border-r",
            sidebarOpen ? "w-60" : "w-16"
          )}
        >
          <div className={cn(
            "flex h-16 items-center gap-2 px-4 border-b",
            sidebarOpen ? "justify-between" : "justify-center"
          )}>
            {sidebarOpen && (
              <>
                <Clock className="w-6 h-6 text-accent" />
                <span className="text-lg font-semibold">Timesheet</span>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8"
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform",
                !sidebarOpen && "rotate-180"
              )} />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-colors hover:text-gray-900 hover:bg-gray-100",
                      isActive && "bg-gray-100 text-gray-900",
                      !sidebarOpen && "justify-center px-2"
                    )
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.name}</span>}
                </NavLink>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t space-y-1">
              {secondaryNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-colors hover:text-gray-900 hover:bg-gray-100",
                      isActive && "bg-gray-100 text-gray-900",
                      !sidebarOpen && "justify-center px-2"
                    )
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.name}</span>}
                </NavLink>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <div className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-60" : "ml-16"
        )}>
          {/* Top bar */}
          <header className={cn(
            "fixed top-0 right-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-6",
            sidebarOpen ? "left-60" : "left-16"
          )}>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-4">
              <Inbox>
                <button
                  type="button"
                  className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <span className="sr-only">Ver notificações</span>
                  <Bell className="h-6 w-6" />
                </button>
              </Inbox>

              <img
                className="inline-block h-8 w-8 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
              />
            </div>
          </header>

          {/* Page content */}
          <main className="p-6 mt-16">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
