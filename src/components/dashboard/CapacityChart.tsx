
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
import { Checkbox } from "@/components/ui/checkbox";
import type { MonthlyData } from "@/types/dashboard";

interface CapacityChartProps {
  data: MonthlyData[];
  currentMonth: string | null;
  showCapacit?: boolean;
  showHoursWorked?: boolean;
  showAverage?: boolean;
  onToggleSeries: (series: "capacit" | "hoursWorked" | "average") => void;
}

const CapacityChart = ({ 
  data, 
  currentMonth,
  showCapacit = true,
  showHoursWorked = true,
  showAverage = true,
  onToggleSeries
}: CapacityChartProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Capacidade x Horas Realizadas {currentMonth && `(${currentMonth})`}
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
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
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
            {showAverage && (
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
