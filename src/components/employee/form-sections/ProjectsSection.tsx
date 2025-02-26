
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Client {
  id: string;
  name: string;
  projects: Project[];
}

interface Project {
  id: string;
  name: string;
}

interface ProjectsSectionProps {
  clients: Client[];
  selectedClient: string;
  selectedProjects: string[];
  setSelectedClient: (clientId: string) => void;
  handleProjectToggle: (projectId: string) => void;
}

export const ProjectsSection = ({
  clients,
  selectedClient,
  selectedProjects,
  setSelectedClient,
  handleProjectToggle,
}: ProjectsSectionProps) => {
  const currentClientProjects = selectedClient
    ? clients.find(c => c.id === selectedClient)?.projects || []
    : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Projetos</h3>
      <div className="space-y-2">
        <Label>Selecione o Cliente</Label>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedClient && (
        <div className="space-y-2">
          <Label>Projetos do Cliente</Label>
          <div className="grid grid-cols-2 gap-4">
            {currentClientProjects.map(project => (
              <div key={project.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`project-${project.id}`}
                  checked={selectedProjects.includes(project.id)}
                  onCheckedChange={() => handleProjectToggle(project.id)}
                />
                <Label htmlFor={`project-${project.id}`}>{project.name}</Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
