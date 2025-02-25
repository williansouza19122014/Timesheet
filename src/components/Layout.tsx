
import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  Users,
  Building2,
  FileBarChart,
  Settings,
  UserCircle,
  Bell,
  KanbanSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Inbox from "./notifications/Inbox";

const Layout = () => {
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
      name: "Equipe",
      href: "/equipe",
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
        <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white border-r">
          <div className="flex flex-col flex-1 gap-2">
            <div className="flex h-16 items-center gap-2 px-6 border-b">
              <img
                src="/favicon.ico"
                alt="Logo"
                className="w-8 h-8"
              />
              <span className="text-xl font-semibold">Ponto Digital</span>
            </div>

            <nav className="flex flex-1 flex-col gap-1 p-4">
              <div>
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-colors hover:text-gray-900 hover:bg-gray-100",
                        isActive && "bg-gray-100 text-gray-900"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </NavLink>
                ))}
              </div>

              <div className="mt-auto space-y-1">
                {secondaryNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-colors hover:text-gray-900 hover:bg-gray-100",
                        isActive && "bg-gray-100 text-gray-900"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-72 flex flex-1">
          <div className="flex flex-1 flex-col">
            {/* Top bar */}
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-6">
              <h1 className="text-2xl font-semibold flex-1">Ponto Digital</h1>
              
              <div className="flex items-center gap-4">
                <Inbox>
                  <button
                    type="button"
                    className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  >
                    <span className="sr-only">View notifications</span>
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
            <main className="flex-1 p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
