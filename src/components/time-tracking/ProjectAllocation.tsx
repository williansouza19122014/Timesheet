
import { useMemo, useState } from "react";
import type { ProjectAllocationFormData } from "@/hooks/useTimeEntries";

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

interface ProjectAllocationProps {
  clients: Client[];
  date: Date;
  onAddProject: (allocation: ProjectAllocationFormData) => Promise<void> | void;
  totalHours: string;
  allocatedHours: string;
  allocations: AllocationSummary[];
}

interface AllocationSummary {
  id: string;
  projectId?: string;
  projectName: string;
  hoursLabel: string;
}

const ProjectAllocation = ({
  clients,
  date,
  onAddProject,
  totalHours,
  allocatedHours,
  allocations,
}: ProjectAllocationProps) => {
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedClientProjects = useMemo(
    () => clients.find((client) => client.id === selectedClient)?.projects ?? [],
    [clients, selectedClient]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onAddProject({
        clientId: selectedClient,
        projectId: selectedProject,
        startTime,
        endTime,
      });
      setStartTime("");
      setEndTime("");
      setSelectedProject("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Apontamento de Projetos</h3>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <span
            className={`font-medium ${
              totalHours === allocatedHours ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {allocatedHours} / {totalHours}
          </span>{' '}
          <span className="ml-1 text-slate-500 dark:text-slate-400">horas apontadas</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cliente</label>
            <select
              value={selectedClient}
              onChange={(e) => {
                setSelectedClient(e.target.value);
                setSelectedProject("");
              }}
              required
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#7355F6] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Selecione um cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Projeto</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#7355F6] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              disabled={!selectedClient}
            >
              <option value="">Selecione um projeto</option>
              {selectedClientProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Horario Inicio</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#7355F6] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Horario Fim</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#7355F6] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-gradient-to-r from-[#7355F6] to-[#A26CFF] px-4 py-2 font-medium text-white shadow-sm transition hover:brightness-110"
        >
          {isSubmitting ? "Registrando..." : "Adicionar Projeto"}
        </button>
      </form>
      {allocations.length > 0 ? (
        <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Projetos apontados em {date.toLocaleDateString()}
          </h4>
          <ul className="space-y-2">
            {allocations.map((allocation) => (
              <li
                key={allocation.id}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300"
              >
                <span className="font-medium text-slate-700 dark:text-slate-100">
                  {allocation.projectName}
                </span>
                <span className="font-semibold text-accent">{allocation.hoursLabel}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200/80 bg-slate-50/40 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
          Nenhum projeto foi apontado para este dia.
        </div>
      )}
    </div>
  );
};

export default ProjectAllocation;
