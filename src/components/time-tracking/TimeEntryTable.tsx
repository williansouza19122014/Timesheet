
import { ChevronDown, ChevronUp } from "lucide-react";
import ProjectAllocation from "./ProjectAllocation";

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

interface Client {
  id: string;
  name: string;
  projects: Project[];
}

interface Project {
  id: string;
  name: string;
  description: string;
}

interface TimeEntryTableProps {
  days: Date[];
  entries: { [key: string]: TimeEntry };
  expandedDay: number | null;
  onToggleExpand: (index: number) => void;
  diasSemana: string[];
  formatDate: (date: Date) => string;
  clients: Client[];
}

const TimeEntryTable = ({
  days,
  entries,
  expandedDay,
  onToggleExpand,
  diasSemana,
  formatDate,
  clients,
}: TimeEntryTableProps) => {
  const getRowClassName = (date: Date, entry: TimeEntry) => {
    const baseClasses = "transition-colors hover:bg-gray-50/50";
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const hasProjectHours = entry?.projetos?.reduce((acc, proj) => acc + proj.horas, 0) || 0;
    const [hours, minutes] = (entry?.totalHoras || "00:00").split(':').map(Number);
    const totalWorkMinutes = (hours * 60 + minutes);
    const totalProjectMinutes = hasProjectHours * 60;

    if (isWeekend) return `${baseClasses} bg-gray-50`;
    if (totalWorkMinutes === 0) return baseClasses;
    if (totalWorkMinutes === totalProjectMinutes) return `${baseClasses} bg-green-50`;
    return `${baseClasses} bg-red-50`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-2 px-4">Data</th>
              <th className="text-left py-2 px-4">Dia</th>
              <th className="text-left py-2 px-4">Entrada 1</th>
              <th className="text-left py-2 px-4">Saída 1</th>
              <th className="text-left py-2 px-4">Entrada 2</th>
              <th className="text-left py-2 px-4">Saída 2</th>
              <th className="text-left py-2 px-4">Entrada 3</th>
              <th className="text-left py-2 px-4">Saída 3</th>
              <th className="text-left py-2 px-4">Total</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {days.map((date, index) => {
              const dateStr = date.toISOString().split('T')[0];
              const entry = entries[dateStr] || {
                entrada1: "", saida1: "",
                entrada2: "", saida2: "",
                entrada3: "", saida3: "",
                totalHoras: "00:00",
                projetos: []
              };

              return (
                <>
                  <tr key={dateStr} className={getRowClassName(date, entry)}>
                    <td className="py-1.5 px-4">{formatDate(date)}</td>
                    <td className="py-1.5 px-4">{diasSemana[date.getDay()]}</td>
                    <td className="py-1.5 px-4">
                      <input
                        type="time"
                        value={entry.entrada1}
                        readOnly
                        className="border rounded p-1 bg-transparent"
                      />
                    </td>
                    <td className="py-1.5 px-4">
                      <input
                        type="time"
                        value={entry.saida1}
                        readOnly
                        className="border rounded p-1 bg-transparent"
                      />
                    </td>
                    <td className="py-1.5 px-4">
                      <input
                        type="time"
                        value={entry.entrada2}
                        readOnly
                        className="border rounded p-1 bg-transparent"
                      />
                    </td>
                    <td className="py-1.5 px-4">
                      <input
                        type="time"
                        value={entry.saida2}
                        readOnly
                        className="border rounded p-1 bg-transparent"
                      />
                    </td>
                    <td className="py-1.5 px-4">
                      <input
                        type="time"
                        value={entry.entrada3}
                        readOnly
                        className="border rounded p-1 bg-transparent"
                      />
                    </td>
                    <td className="py-1.5 px-4">
                      <input
                        type="time"
                        value={entry.saida3}
                        readOnly
                        className="border rounded p-1 bg-transparent"
                      />
                    </td>
                    <td className="py-1.5 px-4 font-medium">{entry.totalHoras}</td>
                    <td className="py-1.5 px-4">
                      <button
                        onClick={() => onToggleExpand(index)}
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
                    <tr>
                      <td colSpan={10} className="py-4 px-6">
                        <ProjectAllocation
                          clients={clients}
                          date={date}
                          onAddProject={() => {}}
                          totalHours={entry.totalHoras}
                          allocatedHours="00:00"
                        />
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
  );
};

export default TimeEntryTable;
