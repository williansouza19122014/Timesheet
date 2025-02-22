
import { useState } from "react";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RequestTimeCorrection from "@/components/RequestTimeCorrection";

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
  const [lastRecordTime, setLastRecordTime] = useState<Date | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const { toast } = useToast();
  
  const handleRegisterTime = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Validar intervalo mínimo de 5 minutos
    if (lastRecordTime && (now.getTime() - lastRecordTime.getTime()) < 5 * 60 * 1000) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "É necessário aguardar 5 minutos entre registros"
      });
      return;
    }

    const currentHour = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const entry = entries[today] || {
      entrada1: "", saida1: "",
      entrada2: "", saida2: "",
      entrada3: "", saida3: "",
      totalHoras: "00:00",
      projetos: []
    };

    // Determinar qual campo deve ser preenchido
    let fieldToUpdate = "";
    if (!entry.entrada1) fieldToUpdate = "entrada1";
    else if (!entry.saida1) fieldToUpdate = "saida1";
    else if (!entry.entrada2) fieldToUpdate = "entrada2";
    else if (!entry.saida2) fieldToUpdate = "saida2";
    else if (!entry.entrada3) fieldToUpdate = "entrada3";
    else if (!entry.saida3) fieldToUpdate = "saida3";
    else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Todos os registros do dia já foram feitos"
      });
      return;
    }

    setEntries(prev => ({
      ...prev,
      [today]: {
        ...entry,
        [fieldToUpdate]: currentHour,
        totalHoras: calculateTotalHours(today, fieldToUpdate, currentHour)
      }
    }));

    setLastRecordTime(now);
    
    toast({
      title: "Horário registrado",
      description: `${fieldToUpdate.replace(/\d+/g, ' ')} - ${currentHour}`
    });
  };

  const calculateTotalHours = (date: string, field: string, newValue: string): string => {
    const entry = entries[date] || {
      entrada1: "", saida1: "",
      entrada2: "", saida2: "",
      entrada3: "", saida3: "",
    };
    
    const updatedEntry = { ...entry, [field]: newValue };
    
    let totalMinutes = 0;
    
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
    
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    
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
        <div className="flex gap-2">
          <button
            onClick={handleRegisterTime}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            <Clock className="w-5 h-5" />
            Registrar Ponto
          </button>
          <button
            onClick={() => setShowCorrectionModal(true)}
            className="px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors"
          >
            Solicitar Correção
          </button>
        </div>
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
                          readOnly
                          className="border rounded p-1 bg-gray-50"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="time"
                          value={entry.saida1}
                          readOnly
                          className="border rounded p-1 bg-gray-50"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="time"
                          value={entry.entrada2}
                          readOnly
                          className="border rounded p-1 bg-gray-50"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="time"
                          value={entry.saida2}
                          readOnly
                          className="border rounded p-1 bg-gray-50"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="time"
                          value={entry.entrada3}
                          readOnly
                          className="border rounded p-1 bg-gray-50"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="time"
                          value={entry.saida3}
                          readOnly
                          className="border rounded p-1 bg-gray-50"
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

      <RequestTimeCorrection
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
      />
    </div>
  );
};

export default TimeTracking;
