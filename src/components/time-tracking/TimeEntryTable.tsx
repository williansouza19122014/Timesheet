import { ChevronDown, ChevronUp } from "lucide-react";
import ProjectAllocation from "./ProjectAllocation";
import type { Client } from "@/types/clients";
import type {
  ProjectAllocationFormData,
  TimeEntryAllocationState,
  TimeEntryMap,
  TimeEntryState,
} from "@/hooks/useTimeEntries";

interface TimeEntryTableProps {
  days: Date[];
  entries: TimeEntryMap;
  expandedDay: number | null;
  onToggleExpand: (index: number) => void;
  diasSemana: string[];
  formatDate: (date: Date) => string;
  clients: Client[];
  onAllocateProject: (date: Date, allocation: ProjectAllocationFormData) => Promise<void> | void;
}

const formatDecimalHours = (value: number) => {
  if (!value || Number.isNaN(value)) {
    return "00:00";
  }
  const totalMinutes = Math.round(value * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.max(totalMinutes - hours * 60, 0);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const buildAllocationSummary = (allocations: TimeEntryAllocationState[]) =>
  allocations.map((allocation) => ({
    id: allocation.id,
    projectId: allocation.projectId,
    projectName: allocation.projectName,
    hoursLabel: formatDecimalHours(allocation.hours),
  }));

const EMPTY_DAY_ENTRY: TimeEntryState = {
  entrada1: "",
  saida1: "",
  entrada2: "",
  saida2: "",
  entrada3: "",
  saida3: "",
  totalHoras: "00:00",
  allocations: [],
};

const getRowClassName = (date: Date, entry: TimeEntryState) => {
  const baseClasses = "transition-colors hover:bg-gray-50/50 dark:hover:bg-slate-800/60";
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const totalAllocationHours =
    entry?.allocations?.reduce((acc, allocation) => acc + allocation.hours, 0) ?? 0;
  const [hours, minutes] = (entry?.totalHoras || "00:00").split(":").map(Number);
  const totalWorkMinutes = hours * 60 + minutes;
  const totalProjectMinutes = totalAllocationHours * 60;

  if (isWeekend) return `${baseClasses} bg-gray-50 dark:bg-slate-800/60`;
  if (totalWorkMinutes === 0) return baseClasses;
  if (totalWorkMinutes === totalProjectMinutes) {
    return `${baseClasses} bg-green-50 dark:bg-emerald-500/10`;
  }
  return `${baseClasses} bg-red-50 dark:bg-rose-500/10`;
};

const TimeEntryTable = ({
  days,
  entries,
  expandedDay,
  onToggleExpand,
  diasSemana,
  formatDate,
  clients,
  onAllocateProject,
}: TimeEntryTableProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-slate-700 dark:text-slate-200">
          <thead>
            <tr className="border-b bg-muted/50 dark:border-slate-700 dark:bg-slate-800/60">
              <th className="py-2 px-4 text-center">Data</th>
              <th className="py-2 px-4 text-center">Dia</th>
              <th className="py-2 px-4 text-center">Entrada 1</th>
              <th className="py-2 px-4 text-center">Saída 1</th>
              <th className="py-2 px-4 text-center">Entrada 2</th>
              <th className="py-2 px-4 text-center">Saída 2</th>
              <th className="py-2 px-4 text-center">Entrada 3</th>
              <th className="py-2 px-4 text-center">Saída 3</th>
              <th className="py-2 px-4 text-center">Total</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="text-sm">
            {days.map((date, index) => {
              const dateStr = date.toISOString().split("T")[0];
              const entry = entries[dateStr] ?? EMPTY_DAY_ENTRY;
              const allocationSummary = buildAllocationSummary(entry.allocations);
              const totalAllocated = entry.allocations.reduce(
                (acc, allocation) => acc + allocation.hours,
                0
              );
              const allocatedHoursLabel = formatDecimalHours(totalAllocated);

              const rows: JSX.Element[] = [
                <tr key={`${dateStr}-main`} className={getRowClassName(date, entry)}>
                  <td className="py-1.5 px-4 text-center">{formatDate(date)}</td>
                  <td className="py-1.5 px-4 text-center">{diasSemana[date.getDay()]}</td>
                  <td className="py-1.5 px-4 text-center">
                    <input
                      type="time"
                      value={entry.entrada1}
                      readOnly
                      className="mx-auto block rounded border bg-transparent p-1 text-center dark:border-slate-700 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-1.5 px-4 text-center">
                    <input
                      type="time"
                      value={entry.saida1}
                      readOnly
                      className="mx-auto block rounded border bg-transparent p-1 text-center dark:border-slate-700 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-1.5 px-4 text-center">
                    <input
                      type="time"
                      value={entry.entrada2}
                      readOnly
                      className="mx-auto block rounded border bg-transparent p-1 text-center dark:border-slate-700 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-1.5 px-4 text-center">
                    <input
                      type="time"
                      value={entry.saida2}
                      readOnly
                      className="mx-auto block rounded border bg-transparent p-1 text-center dark:border-slate-700 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-1.5 px-4 text-center">
                    <input
                      type="time"
                      value={entry.entrada3}
                      readOnly
                      className="mx-auto block rounded border bg-transparent p-1 text-center dark:border-slate-700 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-1.5 px-4 text-center">
                    <input
                      type="time"
                      value={entry.saida3}
                      readOnly
                      className="mx-auto block rounded border bg-transparent p-1 text-center dark:border-slate-700 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-1.5 px-4 text-center font-medium text-slate-900 dark:text-slate-100">
                    {entry.totalHoras}
                  </td>
                  <td className="py-1.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleExpand(index)}
                      className="rounded p-1 transition-colors hover:bg-muted"
                    >
                      {expandedDay === index ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>,
              ];

              if (expandedDay === index) {
                rows.push(
                  <tr key={`${dateStr}-details`}>
                    <td colSpan={10} className="py-4 px-6">
                      <ProjectAllocation
                        clients={clients}
                        date={date}
                        onAddProject={(allocation) => onAllocateProject(date, allocation)}
                        totalHours={entry.totalHoras || "00:00"}
                        allocatedHours={allocatedHoursLabel}
                        allocations={allocationSummary}
                      />
                    </td>
                  </tr>
                );
              }

              return rows;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeEntryTable;
