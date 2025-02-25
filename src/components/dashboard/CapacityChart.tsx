
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
import { format, getDaysInMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import type { MonthlyData } from "@/types/dashboard";

interface CapacityChartProps {
  data: MonthlyData[];
  currentMonth: string | null;
  selectedMonth?: number;
  selectedYear?: number;
  showCapacit?: boolean;
  showHoursWorked?: boolean;
  showAverage?: boolean;
  onToggleSeries: (series: "capacit" | "hoursWorked" | "average") => void;
}

const CapacityChart = ({ 
  data, 
  currentMonth,
  selectedMonth,
  selectedYear,
  showCapacit = true,
  showHoursWorked = true,
  showAverage = true,
  onToggleSeries
}: CapacityChartProps) => {
  // Prepare daily data if month is selected
  const chartData = selectedMonth !== undefined && selectedYear !== undefined
    ? (() => {
        const monthData = data[selectedMonth];
        if (!monthData?.dailyData) {
          // Generate mock daily data if not available
          const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
          return Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            capacit: 8, // 8 hours per day
            hoursWorked: 7 + Math.random() * 2, // Random between 7-9 hours
            projectHours: 6 + Math.random() * 2, // Random between 6-8 hours
          }));
        }
        return monthData.dailyData;
      })()
    : data;

  const formattedCurrentMonth = currentMonth 
    ? currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1) 
    : null;

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Capacidade x Horas Realizadas {formattedCurrentMonth && `(${formattedCurrentMonth})`}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-capacit"
              checked={showCapacit}
              onCheckedChange={() => onToggleSeries("capacit")}
            />
            <label htmlFor="show-capacit" className="text-sm cursor-pointer">
              Capacidade
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-hours"
              checked={showHoursWorked}
              onCheckedChange={() => onToggleSeries("hoursWorked")}
            />
            <label htmlFor="show-hours" className="text-sm cursor-pointer">
              Horas Realizadas
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-average"
              checked={showAverage}
              onCheckedChange={() => onToggleSeries("average")}
            />
            <label htmlFor="show-average" className="text-sm cursor-pointer">
              Média Anual
            </label>
          </div>
        </div>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={selectedMonth !== undefined ? "day" : "month"}
              tickFormatter={selectedMonth !== undefined ? String : undefined}
              label={{ 
                value: selectedMonth !== undefined ? "Dia" : "Mês", 
                position: "insideBottom", 
                offset: -5 
              }}
            />
            <YAxis 
              label={{ 
                value: "Horas", 
                angle: -90, 
                position: "insideLeft",
                offset: 10
              }}
            />
            <Tooltip 
              labelFormatter={(label) => 
                selectedMonth !== undefined 
                  ? `Dia ${label}`
                  : label
              }
            />
            <Legend />
            {showCapacit && (
              <Line 
                type="monotone" 
                dataKey="capacit" 
                name="Capacidade" 
                stroke="#8b5cf6" 
                strokeWidth={2}
              />
            )}
            {showHoursWorked && (
              <Line 
                type="monotone" 
                dataKey="hoursWorked" 
                name="Horas Realizadas" 
                stroke="#22c55e" 
                strokeWidth={2}
              />
            )}
            {showAverage && !selectedMonth && (
              <Line 
                type="monotone" 
                dataKey="average" 
                name="Média Anual" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                strokeDasharray="5 5"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CapacityChart;
