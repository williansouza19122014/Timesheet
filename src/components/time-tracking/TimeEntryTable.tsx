import React, { useState } from "react";
import type { Client } from "@/types/clients";
import type { Project } from "@/types/projects";
import type { ProjectAllocationFormData } from "@/hooks/useTimeEntries";

interface TimeEntryTableProps {
  clients: Client[];
  date: Date;
  totalHours: string;
  allocatedHours: string;
  allocations: {
    id: string;
    projectId: string;
    projectName: string;
    hoursLabel: string;
  }[];
  onAddProject: (allocation: ProjectAllocationFormData) => void | Promise<void>;
}

interface FormData {
  projectId: string;
  hours: string;
}

const TimeEntryTable: React.FC<TimeEntryTableProps> = ({
  clients,
  date,
  totalHours,
  allocatedHours,
  allocations,
  onAddProject,
}) => {
  const [formData, setFormData] = useState<FormData>({
    projectId: "",
    hours: "",
  });
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const hours = parseFloat(formData.hours);

    // Validações
    if (!formData.projectId) {
      setError("Selecione um cliente");
      return;
    }

    if (isNaN(hours) || hours <= 0 || hours > 24) {
      setError("Horas inválidas");
      return;
    }

    const selectedClient = clients.find((c) => c.id === formData.projectId);

    try {
      await onAddProject({
        projectId: formData.projectId,
        hours: hours,
        projectName: selectedClient?.name ?? "Projeto sem nome",
      });

      // Limpa o formulário após sucesso
      setFormData({ projectId: "", hours: "" });
    } catch (error) {
      setError("Erro ao adicionar alocação");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Alocação de Horas — {date.toLocaleDateString("pt-BR")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total trabalhado: {totalHours} | Alocado: {allocatedHours}
          </p>
        </div>
      </div>

      {/* Lista de alocações */}
      {allocations.length > 0 ? (
        <ul className="text-sm space-y-1">
          {allocations.map((allocation) => (
            <li
              key={allocation.id}
              className="flex justify-between border-b pb-1 dark:border-slate-700"
            >
              <span>
                {allocation.projectName} — {allocation.hoursLabel}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500 italic">
          Nenhuma alocação cadastrada para este dia.
        </p>
      )}

      {/* Formulário de nova alocação */}
      <div className="mt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <select
              value={formData.projectId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, projectId: e.target.value }))
              }
              className="flex-1 rounded border p-2 dark:bg-slate-800 dark:border-slate-700"
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={formData.hours}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, hours: e.target.value }))
              }
              step="0.25"
              min="0"
              max="24"
              placeholder="Horas"
              className="w-24 rounded border p-2 text-center dark:bg-slate-800 dark:border-slate-700"
            />

            <button
              type="submit"
              className="rounded bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
              disabled={!formData.projectId || !formData.hours}
            >
              Adicionar
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 mt-2">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default TimeEntryTable;

export interface Project {
  id: string;
  name: string;
  clientId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAllocationFormData {
  projectId: string;
  hours: number;
  projectName: string;
}

export const useTimeEntries = () => {
  // Implementação do hook
};
