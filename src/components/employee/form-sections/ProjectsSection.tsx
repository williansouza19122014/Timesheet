
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types/clients";

interface ProjectsSectionProps {
  clients: Client[];
  selectedClient: string;
  selectedProjects: string[];
  setSelectedClient: (clientId: string) => void;
  handleProjectToggle: (projectId: string) => void;
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

export const ProjectsSection = ({
  clients,
  selectedClient,
  selectedProjects,
  setSelectedClient,
  handleProjectToggle,
  setClients
}: ProjectsSectionProps) => {
  const { toast } = useToast();
  
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    try {
      const savedClients = localStorage.getItem('tempClients');
      if (savedClients) {
        const parsedClients = JSON.parse(savedClients);
        // Garantindo que os clientes tenham todas as propriedades necessárias
        const validClients = parsedClients.map((client: any) => ({
          ...client,
          cnpj: client.cnpj || "",
          startDate: client.startDate || new Date().toISOString(),
        }));
        setClients(validClients);
      } else {
        toast({
          variant: "destructive",
          title: "Nenhum cliente encontrado",
          description: "Por favor, cadastre clientes primeiro na aba de Clientes"
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar clientes",
        description: error.message
      });
    }
  };

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
            {currentClientProjects.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2">
                Este cliente não possui projetos cadastrados
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
