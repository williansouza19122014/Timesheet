
import { useState } from "react";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";

interface TimeEntry {
  entrada1: string;
  saida1: string;
  entrada2: string;
  saida2: string;
  entrada3: string;
  saida3: string;
  totalHoras: string;
  projetos: ProjectEntry[];
}

interface ProjectEntry {
  projeto: string;
  horas: number;
}

const TimeTracking = () => {
  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [entries, setEntries] = useState<{ [key: string]: TimeEntry }>({});
  
  const handleTimeChange = (date: string, field: keyof TimeEntry, value: string) => {
    setEntries(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value,
        totalHoras: calculateTotalHours(date, field, value)
      }
    }));
  };

  const calculateTotalHours = (date: string, field: string, newValue: string): string => {
    const entry = entries[date] || {
      entrada1: "", saida1: "",
      entrada2: "", saida2: "",
      entrada3: "", saida3: "",
    };
    
    // Atualiza o valor atual
    const updatedEntry = { ...entry, [field]: newValue };
    
    let totalMinutes = 0;
    
    // Calcula para cada par de entrada/saída
    const calcPair = (entrada: string, saida: string) => {
      if (entrada && saida) {
        const [entradaHour, entradaMin] = entrada.split(':').map(Number);
        const [saidaHour, saidaMin] = saida.split(':').map(Number);
        return (saidaHour * 60 + saidaMin) - (entradaHour * 60 + entradaMin);
      }
      return 0;
    };
    
    totalMinutes += calcPair(updatedEntry.entrada1, updatedEntry.saida1);
    totalMinutes += calcPair(updatedEntry.entrada2, updatedEntry.saida2);
    totalMinutes += calcPair(updatedEntry.entrada3, updatedEntry.saida3);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getDaysInCurrentWeek = () => {
    const today = new Date();
    const days = [];
    
    // Encontra o domingo desta semana
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    
    // Gera array com os 7 dias da semana
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Registro de Horas</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4">Data</th>
                <th className="text-left py-3 px-4">Dia</th>
                <th className="text-left py-3 px-4">Entrada 1</th>
                <th className="text-left py-3 px-4">Saída 1</th>
                <th className="text-left py-3 px-4">Entrada 2</th>
                <th className="text-left py-3 px-4">Saída 2</th>
                <th className="text-left py-3 px-4">Entrada 3</th>
                <th className="text-left py-3 px-4">Saída 3</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {getDaysInCurrentWeek().map((date, index) => {
                const dateStr = formatDate(date);
                const entry = entries[dateStr] || {
                  entrada1: "", saida1: "",
                  entrada2: "", saida2: "",
                  entrada3: "", saida3: "",
                  totalHoras: "00:00",
                  projetos: []
                };

                return (
                  <>
                    <tr key={dateStr} className={`border-b hover:bg-muted/50 transition-colors ${
                      expandedDay === index ? 'bg-muted/50' : ''
                    }`}>
                      <td className="py-3 px-4">{dateStr}</td>
                      <td className="py-3 px-4">{diasSemana[date.getDay()]}</td>
                      <td className="py-3 px-4">
                        <input
                          type="time"
                          value={entry.entrada1}
                          onChange={(e) => handleTimeChange(dateStr, "entrada1", e.target.value)}
                          className="border rounded p-1"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="time"
                          value={entry.saida1}
                          onChange={(e) => handleTimeChange(dateStr, "saida1", e.target.value)}
                          className="border rounded p-1"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="time"
                          value={entry.entrada2}
                          onChange={(e) => handleTimeChange(dateStr, "entrada2", e.target.value)}
                          className="border rounded p-1"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="time"
                          value={entry.saida2}
                          onChange={(e) => handleTimeChange(dateStr, "saida2", e.target.value)}
                          className="border rounded p-1"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="time"
                          value={entry.entrada3}
                          onChange={(e) => handleTimeChange(dateStr, "entrada3", e.target.value)}
                          className="border rounded p-1"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="time"
                          value={entry.saida3}
                          onChange={(e) => handleTimeChange(dateStr, "saida3", e.target.value)}
                          className="border rounded p-1"
                        />
                      </td>
                      <td className="py-3 px-4 font-medium">{entry.totalHoras}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          {expandedDay === index ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedDay === index && (
                      <tr className="bg-muted/30">
                        <td colSpan={10} className="py-4 px-6">
                          <div className="space-y-4">
                            <h3 className="font-medium">Apontamento de Projetos</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Projeto
                                </label>
                                <select className="w-full p-2 border rounded-lg">
                                  <option>Projeto A</option>
                                  <option>Projeto B</option>
                                  <option>Projeto C</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Horas
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  className="w-full p-2 border rounded-lg"
                                  placeholder="0.0"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
                                Adicionar Projeto
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
