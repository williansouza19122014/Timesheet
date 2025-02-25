
import { useState } from "react";
import { addMonths, subMonths, getDaysInMonth, startOfMonth, format } from "date-fns";
import TimeEntryActions from "@/components/time-tracking/TimeEntryActions";
import MonthNavigation from "@/components/time-tracking/MonthNavigation";
import TimeEntryTable from "@/components/time-tracking/TimeEntryTable";
import RequestTimeCorrection from "@/components/RequestTimeCorrection";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useClients } from "@/hooks/useClients";

const TimeTracking = () => {
  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const { entries, handleRegisterTime } = useTimeEntries(selectedMonth);
  const { clients } = useClients();

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
        clients={clients}
      />

      <RequestTimeCorrection
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
      />
    </div>
  );
};

export default TimeTracking;
