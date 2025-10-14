import { Check } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/dashboard";

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  className?: string;
}

const NotificationsList = ({ notifications, onMarkAsRead, className }: NotificationsListProps) => {
  const navigate = useNavigate();

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-blue-500";
    }
  };

  const handleCardClick = (notification: Notification) => {
    if (notification.type === "warning" || notification.type === "info") {
      navigate(`/kanban?cardId=${notification.id}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Notificacoes</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Clique para ver detalhes ou marcar como lida.
          </p>
        </div>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
          {unreadCount}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {notifications.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200/70 bg-slate-50/70 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            Nenhuma notificacao por aqui.
          </div>
        )}

        {notifications.length > 0 && (
          <div className="max-h-[220px] space-y-3 overflow-y-auto pr-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "rounded-xl border p-3 transition-colors",
                  notification.read
                    ? "border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/40"
                    : "border-transparent bg-white shadow-sm dark:bg-slate-900",
                  (notification.type === "warning" || notification.type === "info")
                    ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    : ""
                )}
                onClick={() => handleCardClick(notification)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className={cn("font-semibold", getNotificationColor(notification.type))}>
                      {notification.title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {notification.message}
                    </p>
                    <span className="mt-1 block text-xs text-slate-400">
                      {format(notification.date, "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                      className="text-accent transition-colors hover:text-accent/80"
                      title="Marcar como lida"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
