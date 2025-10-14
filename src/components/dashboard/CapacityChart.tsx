import { useMemo } from "react";
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
import { getDaysInMonth } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { MonthlyData } from "@/types/dashboard";

interface CapacityChartProps {
  data: MonthlyData[];
  currentMonth: string | null;
  selectedMonth?: number;
  selectedMonthLabel?: string;
  selectedYear?: number;
  showCapacit?: boolean;
  showHoursWorked?: boolean;
  showAverage?: boolean;
  onToggleSeries: (series: "capacit" | "hoursWorked" | "average") => void;
  className?: string;
}

type ChartEntry = MonthlyData | { day: number; capacit: number; hoursWorked: number; projectHours: number };

const CapacityChart = ({
  data,
  currentMonth,
  selectedMonth,
  selectedMonthLabel,
  selectedYear,
  showCapacit = true,
  showHoursWorked = true,
  showAverage = true,
  onToggleSeries,
  className,
}: CapacityChartProps) => {
  const chartData = useMemo<ChartEntry[]>(() => {
    if (
      selectedMonthLabel === undefined ||
      selectedMonth === undefined ||
      selectedYear === undefined
    ) {
      return data;
    }

    const monthData = data.find((item) => item.month === selectedMonthLabel);
    if (!monthData) {
      return data;
    }

    if (monthData.dailyData?.length) {
      return monthData.dailyData;
    }

    const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
    const dailyCapacit = Number((monthData.capacit / daysInMonth).toFixed(1));
    const dailyWorked = Number((monthData.hoursWorked / daysInMonth).toFixed(1));
    const dailyProjects = Number((monthData.projectHours / daysInMonth).toFixed(1));

    return Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      capacit: dailyCapacit,
      hoursWorked: dailyWorked,
      projectHours: dailyProjects,
    }));
  }, [data, selectedMonth, selectedMonthLabel, selectedYear]);

  const formattedCurrentMonth = currentMonth
    ? currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)
    : null;

  const yDomain = useMemo<[number, number]>(() => {
    const values: number[] = [];

    chartData.forEach((entry) => {
      values.push(entry.capacit);
      values.push(entry.hoursWorked);

      if (showAverage && !selectedMonthLabel && "average" in entry) {
        values.push(entry.average);
      }
    });

    const maxValue = values.length ? Math.max(...values) : 10;
    const upperBound = Math.max(20, Math.ceil(maxValue / 10) * 10 + 4);

    return [0, upperBound];
  }, [chartData, showAverage, selectedMonthLabel]);

  const isDailyView = selectedMonthLabel !== undefined;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Capacidade x Horas Realizadas {formattedCurrentMonth && `(${formattedCurrentMonth})`}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ajuste as series abaixo para comparar desempenho ao longo do tempo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600 transition-colors dark:text-slate-300">
            <Checkbox
              id="show-capacit"
              checked={showCapacit}
              onCheckedChange={() => onToggleSeries("capacit")}
            />
            Capacidade
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 transition-colors dark:text-slate-300">
            <Checkbox
              id="show-hours"
              checked={showHoursWorked}
              onCheckedChange={() => onToggleSeries("hoursWorked")}
            />
            Horas Realizadas
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 transition-colors dark:text-slate-300">
            <Checkbox
              id="show-average"
              checked={showAverage}
              onCheckedChange={() => onToggleSeries("average")}
            />
            Media Anual
          </label>
        </div>
      </div>
      <div className="mt-4 h-[260px] md:h-[280px] lg:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 16, right: 24, bottom: 12, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
            <XAxis
              stroke="#94a3b8"
              tick={{ fill: "#64748b", fontSize: 12 }}
              dataKey={isDailyView ? "day" : "month"}
              tickFormatter={isDailyView ? String : undefined}
              height={36}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: "#64748b", fontSize: 12 }}
              domain={yDomain}
              tickCount={5}
            />
            <Tooltip
              labelFormatter={(label) => (isDailyView ? `Dia ${label}` : String(label))}
              formatter={(value: number, name: string) => [`${typeof value === "number" ? value.toFixed(1) : value}h`, name]}
            />
            <Legend verticalAlign="top" height={32} iconType="circle" />
            {showCapacit && (
              <Line
                type="monotone"
                dataKey="capacit"
                name="Capacidade"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
            {showHoursWorked && (
              <Line
                type="monotone"
                dataKey="hoursWorked"
                name="Horas Realizadas"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
            {showAverage && !isDailyView && (
              <Line
                type="monotone"
                dataKey="average"
                name="Media Anual"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CapacityChart;


