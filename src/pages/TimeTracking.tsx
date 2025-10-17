
import { useMemo, useState } from "react";
import { addMonths, subMonths, getDaysInMonth, startOfMonth, format } from "date-fns";
import TimeEntryActions from "@/components/time-tracking/TimeEntryActions";
import MonthNavigation from "@/components/time-tracking/MonthNavigation";
import TimeEntryTable from "@/components/time-tracking/TimeEntryTable";
import RequestTimeCorrection from "@/components/RequestTimeCorrection";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useAuth } from "@/hooks/useAuth";
import { useClients } from "@/hooks/useClients";

const TimeTracking = () => {
  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const { entries, handleRegisterTime, handleAllocateProject } = useTimeEntries(selectedMonth);
  const { clients } = useClients();
  const { user } = useAuth();

  const allowedClients = useMemo(() => {
    if (!clients.length) {
      return [];
    }

    if (!user) {
      return clients;
    }

    const allowedClientIds = new Set((user.selectedClients ?? []) as string[]);
    const allowedProjectIds = new Set((user.selectedProjects ?? []) as string[]);

    return clients
      .map((client) => {
        const filteredProjects = allowedProjectIds.size > 0
          ? (client.projects ?? []).filter((project) => allowedProjectIds.has(project.id))
          : client.projects ?? [];

        const includeClientById = allowedClientIds.size === 0 || allowedClientIds.has(client.id);
        const hasProjects = filteredProjects.length > 0;

        if (allowedProjectIds.size > 0) {
          if (!hasProjects) {
            return null;
          }
          if (!includeClientById && allowedClientIds.size > 0) {
            return null;
          }

          return { ...client, projects: filteredProjects };
        }

        if (!includeClientById) {
          return null;
        }

        return { ...client, projects: filteredProjects };
      })
      .filter((client): client is typeof clients[number] => Boolean(client));
  }, [clients, user]);

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
        clients={allowedClients}
        onAllocateProject={handleAllocateProject}
      />

      <RequestTimeCorrection
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
      />
    </div>
  );
};

export default TimeTracking;
