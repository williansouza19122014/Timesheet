
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Client, Project, TeamMember } from "@/types/clients";
import ClientForm from "@/components/clients/ClientForm";
import ClientCard from "@/components/clients/ClientCard";
import { supabase } from "@/lib/supabase";

interface ProjectMember {
  id: string;
  start_date: string;
  end_date: string | null;
  role: string;
  is_leader: boolean;
  system_users: {
    id: string;
    name: string;
    email: string;
  };
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState<string | null>(null);
  const [showTeamForm, setShowTeamForm] = useState<{clientId: string, projectId: string} | null>(null);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      // Buscar clientes e projetos
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select(`
          *,
          projects (
            id,
            name,
            description,
            start_date,
            end_date
          )
        `);

      if (clientsError) throw clientsError;

      // Para cada projeto, buscar os membros da equipe
      const clientsWithTeams = await Promise.all(clientsData.map(async (client) => {
        const projectsWithTeams = await Promise.all(client.projects.map(async (project) => {
          const { data: teamMembers, error: teamError } = await supabase
            .from('project_members')
            .select(`
              id,
              start_date,
              end_date,
              role,
              is_leader,
              system_users!inner (
                id,
                name,
                email
              )
            `)
            .eq('project_id', project.id)
            .is('end_date', null);

          if (teamError) throw teamError;

          // Formatar os membros da equipe
          const team = (teamMembers as ProjectMember[]).map(member => ({
            id: member.id,
            name: member.system_users.name,
            email: member.system_users.email,
            startDate: member.start_date,
            endDate: member.end_date,
            role: member.role,
            isLeader: member.is_leader
          }));

          // Buscar membros anteriores da equipe
          const { data: previousMembers, error: previousError } = await supabase
            .from('project_members')
            .select(`
              id,
              start_date,
              end_date,
              role,
              is_leader,
              system_users!inner (
                id,
                name,
                email
              )
            `)
            .eq('project_id', project.id)
            .not('end_date', 'is', null);

          if (previousError) throw previousError;

          const formattedPreviousMembers = (previousMembers as ProjectMember[]).map(member => ({
            id: member.id,
            name: member.system_users.name,
            email: member.system_users.email,
            startDate: member.start_date,
            endDate: member.end_date,
            role: member.role,
            isLeader: member.is_leader
          }));

          return {
            ...project,
            team,
            previousMembers: formattedPreviousMembers,
            leader: team.find(member => member.isLeader)
          };
        }));

        return {
          ...client,
          projects: projectsWithTeams
        };
      }));

      setClients(clientsWithTeams);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar clientes",
        description: error.message
      });
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold">Clientes e Projetos</h1>
        <button
          onClick={() => {
            setEditingClient(null);
            setShowNewClientForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {(showNewClientForm || editingClient) && (
        <ClientForm
          onSubmit={async (client) => {
            if (editingClient) {
              const updatedClients = clients.map(c => 
                c.id === editingClient.id ? client : c
              );
              setClients(updatedClients);
              setEditingClient(null);
            } else {
              setClients(prev => [...prev, client]);
            }
            setShowNewClientForm(false);
            await fetchClients(); // Recarregar dados após alteração
          }}
          onCancel={() => {
            setShowNewClientForm(false);
            setEditingClient(null);
          }}
          editingClient={editingClient}
        />
      )}

      <div className="grid gap-4">
        {clients.map(client => (
          <ClientCard
            key={client.id}
            client={client}
            isExpanded={expandedClients.includes(client.id)}
            showNewProjectForm={showNewProjectForm === client.id}
            showTeamForm={showTeamForm?.projectId}
            onToggleExpand={() => {
              setExpandedClients(prev => 
                prev.includes(client.id) 
                  ? prev.filter(id => id !== client.id)
                  : [...prev, client.id]
              );
            }}
            onShowNewProjectForm={() => setShowNewProjectForm(client.id)}
            onAddProject={async (project) => {
              const updatedClients = clients.map(c => {
                if (c.id === client.id) {
                  return {
                    ...c,
                    projects: [...c.projects, project]
                  };
                }
                return c;
              });
              setClients(updatedClients);
              setShowNewProjectForm(null);
              await fetchClients(); // Recarregar dados após alteração
            }}
            onCancelProjectForm={() => setShowNewProjectForm(null)}
            onShowTeamForm={(projectId) => setShowTeamForm({ clientId: client.id, projectId })}
            onEditTeamMember={async (projectId, memberId, endDate) => {
              try {
                const { error } = await supabase
                  .from('project_members')
                  .update({ end_date: endDate })
                  .eq('id', memberId);

                if (error) throw error;

                await fetchClients(); // Recarregar dados após alteração
                
                toast({
                  title: "Membro atualizado com sucesso",
                  description: "As informações do membro da equipe foram atualizadas."
                });
              } catch (error: any) {
                console.error('Erro ao atualizar membro:', error);
                toast({
                  variant: "destructive",
                  title: "Erro ao atualizar membro",
                  description: error.message
                });
              }
            }}
            onEdit={() => {
              setEditingClient(client);
              setShowNewClientForm(true);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Clients;
