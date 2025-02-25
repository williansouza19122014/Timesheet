
import { useState } from "react";
import { Calendar as CalendarIcon, Clock, BarChart } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import Inbox from "@/components/notifications/Inbox";

// Dados mockados para exemplo
const mockChartData = [
  { date: "01/04", hours: 8 },
  { date: "02/04", hours: 7.5 },
  { date: "03/04", hours: 8 },
  { date: "04/04", hours: 8.5 },
  { date: "05/04", hours: 7 },
  { date: "08/04", hours: 8 },
  { date: "09/04", hours: 8 },
];

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showHolidayCalendar, setShowHolidayCalendar] = useState(false);

  // Cálculo mock do capacit
  const workingDays = 21; // Dias úteis do mês atual
  const dailyHours = 8; // Horas diárias
  const capacit = workingDays * dailyHours;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <button
          onClick={() => setShowHolidayCalendar(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <CalendarIcon className="w-5 h-5" />
          Calendário
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-accent" />
            <h2 className="font-semibold">Total de Horas</h2>
          </div>
          <p className="text-3xl font-bold">164h</p>
          <p className="text-sm text-muted-foreground">
            Mês atual: {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <BarChart className="w-6 h-6 text-accent" />
            <h2 className="font-semibold">Horas em Projetos</h2>
          </div>
          <p className="text-3xl font-bold">156h</p>
          <p className="text-sm text-muted-foreground">
            95% do total de horas
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CalendarIcon className="w-6 h-6 text-accent" />
            <h2 className="font-semibold">Capacit do Mês</h2>
          </div>
          <p className="text-3xl font-bold">{capacit}h</p>
          <p className="text-sm text-muted-foreground">
            {workingDays} dias úteis x {dailyHours}h
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-4">Evolução de Horas</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="hours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#hours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="relative">
          <h2 className="font-semibold mb-4">Caixa de Entrada</h2>
          <div className="absolute bottom-4 right-4">
            <Inbox />
          </div>
        </div>
      </div>

      {showHolidayCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Calendário de Feriados</h3>
            {/* Implementar calendário de feriados aqui */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowHolidayCalendar(false)}
                className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
