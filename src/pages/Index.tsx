import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import CapacityChart from "@/components/dashboard/CapacityChart";
import HoursSummary from "@/components/dashboard/HoursSummary";
import NotificationsList from "@/components/dashboard/NotificationsList";
import MonthYearSelect from "@/components/dashboard/MonthYearSelect";
import type { MonthlyData, HoursBreakdown, Notification } from "@/types/dashboard";
import { fetchDashboardOverview, type DashboardOverview } from "@/lib/dashboard-api";
import { Skeleton } from "@/components/ui/skeleton";

const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const buildEmptyMonthlyData = (label: string): MonthlyData => ({
  month: label,
  capacit: 0,
  hoursWorked: 0,
  projectHours: 0,
  average: 0,
});

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showCapacit, setShowCapacit] = useState(true);
  const [showHoursWorked, setShowHoursWorked] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsState, setNotificationsState] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDashboardOverview({
          month: selectedMonth + 1,
          year: selectedYear,
        });
        setOverview(data);
        setNotificationsState(
          data.notifications.map((notification) => ({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            date: new Date(notification.date),
            read: false,
            type: notification.type,
          }))
        );
      } catch (error) {
        console.error("Failed to load dashboard overview", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar o dashboard",
          description: "Não foi possível carregar os dados. Tente novamente em instantes.",
        });
        setOverview(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadOverview();
  }, [selectedMonth, selectedYear, toast]);

  const processedData = useMemo<MonthlyData[]>(() => {
    if (!overview) {
      return monthLabels.map((label) => buildEmptyMonthlyData(label));
    }

    return overview.monthlySeries.map((point, index) => ({
      month: monthLabels[index] ?? point.month,
      capacit: point.capacit,
      hoursWorked: point.hoursWorked,
      projectHours: point.projectHours,
      average: point.average,
    }));
  }, [overview]);

  const selectedMonthLabel = useMemo(() => {
    if (selectedMonth == null) return undefined;
    return monthLabels[selectedMonth];
  }, [selectedMonth]);

  const currentMonthData = useMemo<MonthlyData>(() => {
    if (!overview) {
      return buildEmptyMonthlyData(selectedMonthLabel ?? monthLabels[new Date().getMonth()]);
    }
    const monthPoint = overview.monthlySeries[selectedMonth] ?? overview.monthlySeries[0];
    return {
      month: monthLabels[selectedMonth] ?? monthPoint.month,
      capacit: overview.summary.capacityHours,
      hoursWorked: overview.summary.hoursWorked,
      projectHours: overview.summary.projectHours,
      average: monthPoint?.average ?? 0,
    };
  }, [overview, selectedMonth, selectedMonthLabel]);

  const breakdown = useMemo<HoursBreakdown>(() => {
    if (!overview) {
      return {
        internalProjects: 0,
        vacation: 0,
        medicalLeave: 0,
      };
    }
    return {
      internalProjects: overview.breakdown.internalProjects,
      vacation: overview.breakdown.vacation,
      medicalLeave: overview.breakdown.medicalLeave,
    };
  }, [overview]);

  const handleMarkAsRead = (id: string) => {
    setNotificationsState((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const currentMonthLabel = selectedMonth !== null
    ? format(new Date(selectedYear, selectedMonth, 1), "MMMM", { locale: ptBR })
    : null;

  const handleSeriesToggle = (series: "capacit" | "hoursWorked") => {
    if (series === "capacit") {
      setShowCapacit((prev) => !prev);
      return;
    }

    if (series === "hoursWorked") {
      setShowHoursWorked((prev) => !prev);
    }
  };

  return (
    <div className="animate-fade-in space-y-4 pb-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <MonthYearSelect
          currentMonth={selectedMonth}
          currentYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          className="w-full md:w-auto md:min-w-[360px]"
        />
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-72 w-full rounded-3xl" />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Skeleton className="h-60 w-full rounded-3xl" />
            <Skeleton className="h-60 w-full rounded-3xl" />
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-4">
          <CapacityChart
            data={processedData}
            currentMonth={currentMonthLabel ?? undefined}
            selectedMonth={selectedMonth ?? undefined}
            selectedMonthLabel={selectedMonthLabel}
            selectedYear={selectedYear}
            showCapacit={showCapacit}
            showHoursWorked={showHoursWorked}
            onToggleSeries={handleSeriesToggle}
          />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <HoursSummary currentMonthData={currentMonthData} hoursBreakdown={breakdown} />
            <NotificationsList notifications={notificationsState} onMarkAsRead={handleMarkAsRead} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
