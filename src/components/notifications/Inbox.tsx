import {
  cloneElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import type { Notification } from "@/types/dashboard";
import { fetchDashboardOverview } from "@/lib/dashboard-api";

interface InboxProps {
  children: ReactElement;
}

const TYPE_BADGES: Record<Notification["type"], string> = {
  info: "bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300",
  warning: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300",
  success: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300",
  error: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
};

const STORAGE_KEY = "timesheet_read_notifications";

const readStorage = (): Record<string, true> => {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Record<string, true>) : {};
  } catch {
    return {};
  }
};

const writeStorage = (map: Record<string, true>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};

const Inbox = ({ children }: InboxProps) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pendingNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read),
    [notifications]
  );

  const pendingCount = pendingNotifications.length;

  const close = useCallback(() => setOpen(false), []);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      close();
    }, 3000);
  };

  useEffect(() => clearCloseTimer, []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        close();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handler);
    }

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [open, close]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const overview = await fetchDashboardOverview();
      const stored = readStorage();
      const mapped: Notification[] = overview.notifications.map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        date: new Date(item.date),
        type: item.type,
        read: Boolean(stored[item.id]),
      }));
      setNotifications(mapped);
    } catch (error) {
      console.error("Failed to load notifications", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  const togglePanel = () => setOpen((previous) => !previous);

  const handleMarkAllAsRead = () => {
    if (pendingCount === 0) return;
    const stored = readStorage();
    const updated = { ...stored };
    pendingNotifications.forEach((notification) => {
      updated[notification.id] = true;
    });
    writeStorage(updated);
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  const trigger = useMemo(() => {
    return cloneElement(children, {
      "aria-expanded": open,
      onClick: (event: React.MouseEvent) => {
        children.props.onClick?.(event);
        togglePanel();
      },
    });
  }, [children, open]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {trigger}
        {pendingCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-2 w-2 rounded-full bg-[#7C6CFF] ring-2 ring-white dark:ring-slate-900" />
        )}
      </div>

      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-80 max-w-xs rounded-3xl border border-slate-200 bg-white shadow-xl transition dark:border-slate-800 dark:bg-slate-900"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notificações</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {pendingCount > 0 ? `${pendingCount} pendências` : "Tudo resolvido por aqui."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-xs font-medium text-[#7C6CFF] transition hover:text-[#5E4BFF] dark:text-[#C3B6FF] dark:hover:text-[#E0DAFF]"
            >
              Marcar como lidas
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto px-3 py-4">
            {loading && (
              <div className="space-y-3">
                {[0, 1].map((index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="mt-2 h-2 w-52 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                ))}
              </div>
            )}

            {!loading && pendingNotifications.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
                Nenhuma notificação pendente.
              </div>
            )}

            {!loading &&
              pendingNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="mb-3 last:mb-0 rounded-2xl border border-transparent bg-slate-50 px-4 py-3 text-sm shadow-sm transition hover:border-slate-200 hover:bg-white dark:bg-slate-900/70 dark:hover:border-slate-700 dark:hover:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {notification.title}
                    </span>
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TYPE_BADGES[notification.type]}`}
                    >
                      {notification.type === "info"
                        ? "Info"
                        : notification.type === "warning"
                          ? "Alerta"
                          : notification.type === "success"
                            ? "Sucesso"
                            : "Erro"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{notification.message}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {notification.date.toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
