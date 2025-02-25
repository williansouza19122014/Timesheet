
import { useState } from "react";
import { Calendar as CalendarIcon, Clock, BarChart, Plus, Trash2 } from "lucide-react";
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isWeekend, isWithinInterval } from "date-fns";
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
import { useToast } from "@/hooks/use-toast";

interface Holiday {
  id: string;
  date: Date;
  name: string;
  year: number;
}

const mockHolidays: Holiday[] = [
  { id: "1", date: new Date("2024-01-01"), name: "Ano Novo", year: 2024 },
  { id: "2", date: new Date("2024-04-21"), name: "Tiradentes", year: 2024 },
  { id: "3", date: new Date("2024-05-01"), name: "Dia do Trabalho", year: 2024 },
];

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showHolidayCalendar, setShowHolidayCalendar] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>(mockHolidays);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const { toast } = useToast();

  // Cálculo de dias úteis
  const calculateWorkingDays = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    
    return days.filter(day => {
      const isHoliday = holidays.some(holiday => 
        format(holiday.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      return !isWeekend(day) && !isHoliday;
    }).length;
  };

  const workingDays = calculateWorkingDays(selectedMonth);
  const dailyHours = 8; // Horas diárias padrão
  const capacit = workingDays * dailyHours;

  // Dados mockados para o gráfico
  const mockChartData = [
    { date: "01/04", hours: 8, project: 7.5 },
    { date: "02/04", hours: 7.5, project: 7 },
    { date: "03/04", hours: 8, project: 8 },
    { date: "04/04", hours: 8.5, project: 8 },
    { date: "05/04", hours: 7, project: 6.5 },
    { date: "08/04", hours: 8, project: 7.5 },
    { date: "09/04", hours: 8, project: 7.8 },
  ];

  const totalHours = mockChartData.reduce((acc, curr) => acc + curr.hours, 0);
  const totalProjectHours = mockChartData.reduce((acc, curr) => acc + curr.project, 0);
  const projectPercentage = ((totalProjectHours / totalHours) * 100).toFixed(1);

  const addHoliday = () => {
    if (!newHolidayName || !newHolidayDate) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos do feriado"
      });
      return;
    }

    const newHoliday: Holiday = {
      id: Date.now().toString(),
      date: new Date(newHolidayDate),
      name: newHolidayName,
      year: selectedYear
    };

    setHolidays(prev => [...prev, newHoliday]);
    setNewHolidayName("");
    setNewHolidayDate("");
    toast({
      title: "Feriado adicionado",
      description: "O feriado foi cadastrado com sucesso"
    });
  };

  const removeHoliday = (id: string) => {
    setHolidays(prev => prev.filter(holiday => holiday.id !== id));
    toast({
      title: "Feriado removido",
      description: "O feriado foi removido com sucesso"
    });
  };

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
          <p className="text-3xl font-bold">{totalHours}h</p>
          <p className="text-sm text-muted-foreground">
            Mês atual: {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <BarChart className="w-6 h-6 text-accent" />
            <h2 className="font-semibold">Horas em Projetos</h2>
          </div>
          <p className="text-3xl font-bold">{totalProjectHours}h</p>
          <p className="text-sm text-muted-foreground">
            {projectPercentage}% do total de horas
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CalendarIcon className="w-6 h-6 text-accent" />
            <h2 className="font-semibold">Capacidade do Mês</h2>
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
                  <linearGradient id="project" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="hours"
                  name="Total de Horas"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#hours)"
                />
                <Area
                  type="monotone"
                  dataKey="project"
                  name="Horas em Projetos"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#project)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-4">Últimas Notificações</h2>
          <div className="relative h-[300px]">
            <Inbox />
          </div>
        </div>
      </div>

      {showHolidayCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Calendário de Feriados</h3>
            
            <div className="mb-6">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border rounded-lg"
              >
                {Array.from({ length: 5 }, (_, i) => 2024 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                placeholder="Nome do feriado"
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />
              <button
                onClick={addHoliday}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Feriado
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Data</th>
                    <th className="px-4 py-2 text-left">Nome</th>
                    <th className="px-4 py-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays
                    .filter(holiday => holiday.year === selectedYear)
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map(holiday => (
                    <tr key={holiday.id} className="border-b">
                      <td className="px-4 py-2">
                        {format(holiday.date, "dd/MM/yyyy")}
                      </td>
                      <td className="px-4 py-2">{holiday.name}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => removeHoliday(holiday.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowHolidayCalendar(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
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
