/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Client } from "@/types/clients";
import { useToast } from "@/hooks/use-toast";

interface ProjectsSectionProps {
  clients: Client[];
  selectedClient: string;
  selectedProjects: string[];
  setSelectedClient: (clientId: string) => void;
  handleProjectToggle: (projectId: string) => void;
  handleClientToggle: (clientId: string) => void;
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  selectedClients: string[];
}

export const ProjectsSection = ({
  clients,
  selectedClient,
  selectedProjects,
  setSelectedClient,
  handleProjectToggle,
  handleClientToggle,
  setClients,
  selectedClients
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

  const availableProjects = selectedClient
    ? clients.find(c => c.id === selectedClient)?.projects || []
    : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Clientes e Projetos</h3>
      
      {/* Lista de Clientes */}
      <div className="space-y-2">
        <Label>Selecione os Clientes</Label>
        <div className="grid grid-cols-2 gap-4">
          {clients.map(client => (
            <div key={client.id} className="flex items-center space-x-2">
              <Checkbox
                id={`client-${client.id}`}
                checked={selectedClients.includes(client.id)}
                onCheckedChange={() => handleClientToggle(client.id)}
              />
              <Label htmlFor={`client-${client.id}`}>{client.name}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Projetos dos Clientes Selecionados */}
      {selectedClients.length > 0 && (
        <div className="space-y-2">
          <Label>Projetos Disponíveis</Label>
          <div className="grid grid-cols-2 gap-4">
            {clients
              .filter(client => selectedClients.includes(client.id))
              .map(client => (
                <div key={client.id} className="space-y-2 border p-3 rounded-lg">
                  <Label className="font-medium">{client.name}</Label>
                  {client.projects?.map(project => (
                    <div key={project.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`project-${project.id}`}
                        checked={selectedProjects.includes(project.id)}
                        onCheckedChange={() => handleProjectToggle(project.id)}
                      />
                      <Label htmlFor={`project-${project.id}`}>{project.name}</Label>
                    </div>
                  ))}
                  {(!client.projects || client.projects.length === 0) && (
                    <p className="text-sm text-muted-foreground">
                      Este cliente não possui projetos cadastrados
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
