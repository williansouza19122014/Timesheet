import { Outlet, NavLink, useNavigate } from "react-router-dom";
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
  Sun,
  Moon,
  LogOut,
  Shield,
  Crown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/context/theme-context";
import { useAccessControl, ROLE_LABELS } from "@/context/access-control-context";
import type { FeatureKey } from "@/context/access-control-context";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";
import Inbox from "./notifications/Inbox";
import { Button } from "./ui/button";

const brandGradient = "from-[#7355F6] to-[#A26CFF]";
const brandGradientDark = "dark:from-[#4C43F6] dark:to-[#6B67FF]";
const brandSurface = "from-[#F1E9FF] to-[#F8F9FF]";
const brandSurfaceDark = "dark:from-[#1F2937] dark:to-[#0B1120]";

type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  feature?: FeatureKey;
  permissionKey?: string;
  requiresMaster?: boolean;
};

const getIconStyles = (isActive: boolean) =>
  isActive
    ? `flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-r ${brandGradient} ${brandGradientDark} text-white shadow-[0_12px_24px_-12px_rgba(115,85,246,0.65)]`
    : "flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all group-hover:border-[#C5B4FF] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-[#7C6CFF]";

const getNavLinkStyles = ({
  isActive,
  isCollapsed,
}: {
  isActive: boolean;
  isCollapsed: boolean;
}) =>
  cn(
    "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
    isCollapsed && "justify-center px-2",
    isActive
      ? `bg-gradient-to-r ${brandSurface} ${brandSurfaceDark} text-slate-900 shadow-inner dark:text-white dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]`
      : undefined
  );

const Layout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { activeRole, canAccess } = useAccessControl();
  const { user, logout } = useAuth();
  const { hasPermission, isMaster } = usePermission();
  const userName = user?.name ?? "Convidado";
  const roleLabel = ROLE_LABELS[activeRole];
  const avatarUrl = user?.photo ?? null;
  const userPosition = user?.position ?? null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation: NavigationItem[] = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      feature: "dashboard",
    },
    {
      name: "Ponto",
      href: "/ponto",
      icon: Clock,
      feature: "timesheet",
    },
    {
      name: "Ferias",
      href: "/ferias",
      icon: Calendar,
      feature: "vacations",
    },
    {
      name: "Kanban",
      href: "/kanban",
      icon: KanbanSquare,
      feature: "kanban",
    },
    {
      name: "Clientes",
      href: "/clientes",
      icon: Building2,
      feature: "clients",
    },
    {
      name: "Colaboradores",
      href: "/cadastro-colaborador",
      icon: Users,
      feature: "employees",
    },
    {
      name: "Relatorios",
      href: "/relatorios",
      icon: FileBarChart,
      feature: "reports",
    },
  ];

  const secondaryNavigation: NavigationItem[] = [
    {
      name: "Configuracoes",
      href: "/configuracoes",
      icon: Settings,
      feature: "settings",
    },
    {
      name: "Perfil",
      href: "/perfil",
      icon: UserCircle,
      feature: "profile",
    },
  ];

  const masterNavigation: NavigationItem[] = [
    {
      name: "Admin Usuarios",
      href: "/admin/users",
      icon: Users,
      permissionKey: "users.list",
      requiresMaster: true,
    },
    {
      name: "Roles & Permissoes",
      href: "/admin/roles",
      icon: Shield,
      permissionKey: "roles.list",
      requiresMaster: true,
    },
    {
      name: "Tenant",
      href: "/admin/tenant",
      icon: Crown,
      permissionKey: "tenant.manage",
      requiresMaster: true,
    },
  ];
  const shouldDisplayItem = (item: NavigationItem) => {
    const featureAllowed = item.feature ? canAccess(item.feature) : true;
    const permissionAllowed = item.permissionKey ? hasPermission(item.permissionKey) || isMaster : true;
    const masterAllowed = item.requiresMaster ? isMaster : true;
    return featureAllowed && permissionAllowed && masterAllowed;
  };

  const primaryItems = navigation.filter(shouldDisplayItem);
  const secondaryItems = [...secondaryNavigation, ...(isMaster ? masterNavigation : [])].filter(
    shouldDisplayItem
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 z-50 flex flex-col border-r bg-white text-slate-600 transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200",
            sidebarOpen ? "w-60" : "w-16"
          )}
        >
          <div className="flex h-16 items-center justify-between border-b bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
            <div className={cn("flex items-center gap-3 transition-all", !sidebarOpen && "mx-auto")}
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-r from-[#7355F6] to-[#A26CFF] text-white shadow-[0_12px_24px_-12px_rgba(115,85,246,0.45)]">
                <Clock className="h-5 w-5" />
              </span>
              {sidebarOpen && (
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Timesheet</span>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              type="button"
              aria-label={sidebarOpen ? "Recolher menu" : "Expandir menu"}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                "h-10 w-10 rounded-xl border-slate-200 bg-white/80 text-slate-600 shadow-sm transition hover:border-accent/60 hover:text-accent dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200",
                !sidebarOpen && "!bg-white/60 dark:!bg-slate-900/50"
              )}
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {primaryItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    getNavLinkStyles({
                      isActive,
                      isCollapsed: !sidebarOpen,
                    })
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          getIconStyles(isActive),
                          !sidebarOpen && "h-8 w-8"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </span>
                      {sidebarOpen && (
                        <span className="text-base font-medium text-slate-700 dark:text-slate-100">
                          {item.name}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="mt-auto space-y-1 border-t pt-4">
              {secondaryItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    getNavLinkStyles({
                      isActive,
                      isCollapsed: !sidebarOpen,
                    })
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          getIconStyles(isActive),
                          !sidebarOpen && "h-8 w-8"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </span>
                      {sidebarOpen && (
                        <span className="text-base font-medium text-slate-700 dark:text-slate-100">
                          {item.name}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
              <div className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                  className={cn(
                    "w-full justify-start gap-3 text-slate-600 dark:text-slate-200",
                    !sidebarOpen && "justify-center px-0"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  {sidebarOpen && <span className="font-medium">Sair</span>}
                </Button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <div
          className={cn(
            "flex-1 transition-all duration-300",
            sidebarOpen ? "ml-60" : "ml-16"
          )}
        >
          {/* Top bar */}
          <header
            className={cn(
              "fixed top-0 right-0 z-40 flex h-16 items-center gap-4 border-b bg-white/80 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-900/80 dark:supports-[backdrop-filter]:bg-slate-900/60",
              sidebarOpen ? "left-60" : "left-16"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="text-slate-600 dark:text-slate-300 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={toggleTheme}
                aria-label={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
                className="relative h-10 w-10 rounded-full border-slate-200 bg-white/80 text-slate-600 transition hover:border-accent/50 hover:text-accent dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
              >
                <Sun
                  className={cn(
                    "h-5 w-5 transition-all",
                    theme === "dark" && "scale-0 -rotate-90"
                  )}
                />
                <Moon
                  className={cn(
                    "absolute h-5 w-5 transition-all",
                    theme === "light" && "scale-0 rotate-90"
                  )}
                />
              </Button>
              <Inbox>
                <button
                  type="button"
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  <span className="sr-only">Ver notificacoes</span>
                  <Bell className="h-5 w-5" />
                </button>
              </Inbox>

              <div className="hidden gap-1 text-right sm:flex sm:flex-col sm:items-end">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{userName}</span>
                <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{roleLabel}</span>
                {userPosition && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">{userPosition}</span>
                )}
              </div>

              {avatarUrl ? (
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover dark:ring-slate-800"
                  src={avatarUrl}
                  alt={userName}
                />
              ) : (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-slate-400 dark:bg-slate-800 dark:ring-slate-800">
                  <UserCircle className="h-5 w-5" />
                </span>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="mt-16 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;



