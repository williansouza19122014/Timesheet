
import { useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Client, Project, TeamMember } from "@/types/clients";
import ClientForm from "@/components/clients/ClientForm";
import ClientCard from "@/components/clients/ClientCard";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState<string | null>(null);
  const [showTeamForm, setShowTeamForm] = useState<{clientId: string, projectId: string} | null>(null);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);

  const handleAddClient = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
    setShowNewClientForm(false);
  };

  const handleAddProject = (clientId: string, newProject: Project) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          projects: [...client.projects, newProject]
        };
      }
      return client;
    }));

    setShowNewProjectForm(null);
    setShowTeamForm({ clientId, projectId: newProject.id });
  };

  const handleAddTeamMember = (clientId: string, projectId: string, member: TeamMember, isLeader: boolean = false) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          projects: client.projects.map(project => {
            if (project.id === projectId) {
              const updatedMember = { ...member, isLeader };
              return {
                ...project,
                team: [...project.team, updatedMember],
                ...(isLeader && { leader: updatedMember })
              };
            }
            return project;
          })
        };
      }
      return client;
    }));
  };

  const handleRemoveTeamMember = (clientId: string, projectId: string, memberId: string) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          projects: client.projects.map(project => {
            if (project.id === projectId) {
              return {
                ...project,
                team: project.team.filter(member => member.id !== memberId),
                ...(project.leader?.id === memberId && { leader: undefined })
              };
            }
            return project;
          })
        };
      }
      return client;
    }));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold">Clientes</h1>
        <button
          onClick={() => setShowNewClientForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {showNewClientForm && (
        <ClientForm
          onSubmit={handleAddClient}
          onCancel={() => setShowNewClientForm(false)}
        />
      )}

      <div className="space-y-4">
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
            onAddProject={(project) => handleAddProject(client.id, project)}
            onCancelProjectForm={() => setShowNewProjectForm(null)}
            onShowTeamForm={(projectId) => setShowTeamForm({ clientId: client.id, projectId })}
            onAddTeamMember={(projectId, member, isLeader) => 
              handleAddTeamMember(client.id, projectId, member, isLeader)}
            onRemoveTeamMember={(projectId, memberId) => 
              handleRemoveTeamMember(client.id, projectId, memberId)}
          />
        ))}
      </div>
    </div>
  );
};

export default Clients;
