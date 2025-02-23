
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { addMonths, subMonths, getDaysInMonth, startOfMonth, format } from "date-fns";
import TimeEntryActions from "@/components/time-tracking/TimeEntryActions";
import MonthNavigation from "@/components/time-tracking/MonthNavigation";
import TimeEntryTable from "@/components/time-tracking/TimeEntryTable";
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
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { toast } = useToast();

  const handleRegisterTime = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
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

  const getDaysInCurrentMonth = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const startDate = startOfMonth(selectedMonth);
    const days = [];
    
    for (let i = 0; i < daysInMonth; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy");
  };

  return (
    <div className="animate-fade-in">
      <TimeEntryActions
        onRegisterTime={handleRegisterTime}
        onRequestCorrection={() => setShowCorrectionModal(true)}
      />

      <MonthNavigation
        selectedMonth={selectedMonth}
        onPreviousMonth={() => setSelectedMonth(prev => subMonths(prev, 1))}
        onNextMonth={() => setSelectedMonth(prev => addMonths(prev, 1))}
        onResetMonth={() => setSelectedMonth(new Date())}
      />

      <TimeEntryTable
        days={getDaysInCurrentMonth()}
        entries={entries}
        expandedDay={expandedDay}
        onToggleExpand={(index) => setExpandedDay(expandedDay === index ? null : index)}
        diasSemana={diasSemana}
        formatDate={formatDate}
      />

      <RequestTimeCorrection
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
      />
    </div>
  );
};

export default TimeTracking;
