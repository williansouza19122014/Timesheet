
import { useState } from "react";
import { Clock } from "lucide-react";

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
  onAddProject: (allocation: ProjectAllocationData) => void;
  totalHours: string;
  allocatedHours: string;
}

interface ProjectAllocationData {
  clientId: string;
  projectId: string;
  startTime: string;
  endTime: string;
}

const ProjectAllocation = ({ clients, date, onAddProject, totalHours, allocatedHours }: ProjectAllocationProps) => {
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProject({
      clientId: selectedClient,
      projectId: selectedProject,
      startTime,
      endTime
    });
    setStartTime("");
    setEndTime("");
  };

  const selectedClientProjects = clients.find(c => c.id === selectedClient)?.projects || [];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Apontamento de Projetos</h3>
        <div className="text-sm">
          <span className={`font-medium ${
            totalHours === allocatedHours ? 'text-green-600' : 'text-red-600'
          }`}>
            {allocatedHours} / {totalHours}
          </span>
          <span className="text-muted-foreground ml-1">horas apontadas</span>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select
              value={selectedClient}
              onChange={(e) => {
                setSelectedClient(e.target.value);
                setSelectedProject("");
              }}
              required
              className="w-full p-2 border rounded-lg"
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
            <label className="block text-sm font-medium mb-1">Projeto</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              required
              className="w-full p-2 border rounded-lg"
              disabled={!selectedClient}
            >
              <option value="">Selecione um projeto</option>
              {selectedClientProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Horário Início</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Horário Fim</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Adicionar Projeto
        </button>
      </form>
    </div>
  );
};

export default ProjectAllocation;
