
import { useState, useEffect } from "react";
import { BellDot, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

// Dados mockados para exemplo
const mockMonthlyData = [
  { month: "Jan", capacit: 168, hoursWorked: 165, average: 166 },
  { month: "Fev", capacit: 160, hoursWorked: 158, average: 166 },
  { month: "Mar", capacit: 176, hoursWorked: 170, average: 166 },
  { month: "Abr", capacit: 168, hoursWorked: 172, average: 166 },
  { month: "Mai", capacit: 176, hoursWorked: 169, average: 166 },
  { month: "Jun", capacit: 168, hoursWorked: 165, average: 166 },
  { month: "Jul", capacit: 168, hoursWorked: 160, average: 166 },
  { month: "Ago", capacit: 176, hoursWorked: 175, average: 166 },
  { month: "Set", capacit: 168, hoursWorked: 167, average: 166 },
  { month: "Out", capacit: 176, hoursWorked: 178, average: 166 },
  { month: "Nov", capacit: 168, hoursWorked: 164, average: 166 },
  { month: "Dez", capacit: 160, hoursWorked: 162, average: 166 },
];

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Aprovação de Horas",
    message: "Suas horas do dia 15/04 foram aprovadas",
    date: new Date("2024-04-15T14:30:00"),
    read: false,
    type: "success"
  },
  {
    id: "2",
    title: "Correção Necessária",
    message: "Por favor, revise suas horas do dia 14/04",
    date: new Date("2024-04-14T16:45:00"),
    read: false,
    type: "warning"
  },
  {
    id: "3",
    title: "Lembrete",
    message: "Não se esqueça de registrar suas horas hoje",
    date: new Date("2024-04-13T09:00:00"),
    read: true,
    type: "info"
  },
];

const Index = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const { toast } = useToast();
  const currentMonth = format(new Date(), 'MMMM', { locale: ptBR });

  // Dados do mês atual
  const currentMonthData = mockMonthlyData[new Date().getMonth()];
  const hoursBalance = currentMonthData.hoursWorked - currentMonthData.capacit;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    toast({
      title: "Notificação marcada como lida",
      description: "A notificação foi atualizada com sucesso"
    });
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "error": return "text-red-500";
      default: return "text-blue-500";
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Capacidade x Horas Realizadas ({currentMonth})</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="capacit" 
                name="Capacidade" 
                stroke="#8b5cf6" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="hoursWorked" 
                name="Horas Realizadas" 
                stroke="#22c55e" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                name="Média Anual" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Horas Realizadas</h3>
              <p className="text-2xl font-bold">{currentMonthData.hoursWorked}h</p>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Horas em Projetos</h3>
              <p className="text-2xl font-bold">{Math.round(currentMonthData.hoursWorked * 0.9)}h</p>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Saldo de Horas</h3>
              <p className={`text-2xl font-bold ${hoursBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {hoursBalance > 0 ? '+' : ''}{hoursBalance}h
              </p>
            </div>
          </div>
        </div>

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
                      onClick={() => markAsRead(notification.id)}
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
      </div>
    </div>
  );
};

export default Index;
