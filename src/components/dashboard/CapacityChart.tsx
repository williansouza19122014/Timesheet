
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
import type { MonthlyData } from "@/types/dashboard";

interface CapacityChartProps {
  data: MonthlyData[];
  currentMonth: string;
}

const CapacityChart = ({ data, currentMonth }: CapacityChartProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-4">Capacidade x Horas Realizadas ({currentMonth})</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
  );
};

export default CapacityChart;
