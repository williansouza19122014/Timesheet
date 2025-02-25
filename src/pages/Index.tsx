import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import CapacityChart from "@/components/dashboard/CapacityChart";
import HoursSummary from "@/components/dashboard/HoursSummary";
import NotificationsList from "@/components/dashboard/NotificationsList";
import MonthYearSelect from "@/components/dashboard/MonthYearSelect";
import type { Notification, MonthlyData, HoursBreakdown } from "@/types/dashboard";

const mockMonthlyData: MonthlyData[] = [
  { month: "Jan", capacit: 168, hoursWorked: 165, projectHours: 150, average: 0 },
  { month: "Fev", capacit: 160, hoursWorked: 158, projectHours: 140, average: 0 },
  { month: "Mar", capacit: 176, hoursWorked: 170, projectHours: 160, average: 0 },
  { month: "Abr", capacit: 168, hoursWorked: 172, projectHours: 155, average: 0 },
  { month: "Mai", capacit: 176, hoursWorked: 169, projectHours: 165, average: 0 },
  null,
  null,
  { month: "Ago", capacit: 176, hoursWorked: 175, projectHours: 165, average: 0 },
  { month: "Set", capacit: 168, hoursWorked: 167, projectHours: 155, average: 0 },
  { month: "Out", capacit: 176, hoursWorked: 178, projectHours: 160, average: 0 },
  { month: "Nov", capacit: 168, hoursWorked: 164, projectHours: 150, average: 0 },
  { month: "Dez", capacit: 160, hoursWorked: 162, projectHours: 145, average: 0 },
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

const mockHoursBreakdown: HoursBreakdown = {
  internalProjects: 8,
  vacation: 16,
  medicalLeave: 4
};

const Index = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showCapacit, setShowCapacit] = useState(true);
  const [showHoursWorked, setShowHoursWorked] = useState(true);
  const [showAverage, setShowAverage] = useState(true);
  const { toast } = useToast();

  const processedData = mockMonthlyData.map((monthData) => {
    if (!monthData) return null;

    const validMonths = mockMonthlyData.filter(m => m !== null) as MonthlyData[];
    const totalHoursWorked = validMonths.reduce((sum, m) => sum + m.hoursWorked, 0);
    const annualAverage = totalHoursWorked / validMonths.length;

    return {
      ...monthData,
      average: annualAverage
    };
  }).filter(Boolean) as MonthlyData[];

  const currentMonthLabel = selectedMonth !== null 
    ? format(new Date(selectedYear, selectedMonth, 1), 'MMMM', { locale: ptBR })
    : null;

  const filteredData = selectedMonth !== null
    ? processedData.filter(data => data.month === format(new Date(selectedYear, selectedMonth, 1), 'MMM'))
    : processedData;

  const currentMonthData = selectedMonth !== null
    ? processedData.find(data => data.month === format(new Date(selectedYear, selectedMonth, 1), 'MMM'))
    || processedData[0]
    : processedData[0];

  const handleSeriesToggle = (series: "capacit" | "hoursWorked" | "average") => {
    switch (series) {
      case "capacit":
        setShowCapacit(prev => !prev);
        break;
      case "hoursWorked":
        setShowHoursWorked(prev => !prev);
        break;
      case "average":
        setShowAverage(prev => !prev);
        break;
    }
  };

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

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      <MonthYearSelect
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      <CapacityChart 
        data={filteredData}
        currentMonth={currentMonthLabel}
        selectedMonth={selectedMonth ?? undefined}
        selectedYear={selectedYear}
        showCapacit={showCapacit}
        showHoursWorked={showHoursWorked}
        showAverage={showAverage}
        onToggleSeries={handleSeriesToggle}
      />

      <div className="grid grid-cols-2 gap-6">
        <HoursSummary 
          currentMonthData={currentMonthData}
          hoursBreakdown={mockHoursBreakdown}
        />
        <NotificationsList 
          notifications={notifications}
          onMarkAsRead={markAsRead}
        />
      </div>
    </div>
  );
};

export default Index;
