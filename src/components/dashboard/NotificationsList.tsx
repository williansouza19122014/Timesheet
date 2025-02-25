
import { Check } from "lucide-react";
import { format } from "date-fns";
import type { Notification } from "@/types/dashboard";

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

const NotificationsList = ({ notifications, onMarkAsRead }: NotificationsListProps) => {
  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "error": return "text-red-500";
      default: return "text-blue-500";
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Notificações</h3>
        <span className="text-sm text-white bg-accent px-2 py-1 rounded-full">
          {notifications.filter(n => !n.read).length}
        </span>
      </div>
      
      <div className="space-y-3 max-h-[200px] overflow-y-auto">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border ${
              notification.read ? 'bg-gray-50' : 'bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className={`font-medium ${getNotificationColor(notification.type)}`}>
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <span className="text-xs text-gray-400 block mt-1">
                  {format(notification.date, "dd/MM/yyyy HH:mm")}
                </span>
              </div>
              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-accent hover:text-accent/80 transition-colors"
                  title="Marcar como lida"
                >
                  <Check className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsList;
