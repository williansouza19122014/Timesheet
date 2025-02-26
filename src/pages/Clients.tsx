
import { useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Client, Project, TeamMember } from "@/types/clients";
import ClientForm from "@/components/clients/ClientForm";
import ClientCard from "@/components/clients/ClientCard";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState<string | null>(null);
  const [showTeamForm, setShowTeamForm] = useState<{clientId: string, projectId: string} | null>(null);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);

  const handleAddClient = (newClient: Client) => {
    if (editingClient) {
      setClients(prev => prev.map(client => 
        client.id === editingClient.id ? newClient : client
      ));
      setEditingClient(null);
    } else {
      setClients(prev => [...prev, newClient]);
    }
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

  const handleEditTeamMember = (clientId: string, projectId: string, memberId: string, endDate: string) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          projects: client.projects.map(project => {
            if (project.id === projectId) {
              const updatedMember = project.team.find(m => m.id === memberId);
              if (!updatedMember) return project;

              const updatedTeam = project.team.filter(m => m.id !== memberId);
              const newMember = { ...updatedMember, endDate };
              
              return {
                ...project,
                team: endDate ? updatedTeam : [...updatedTeam, newMember],
                previousMembers: endDate 
                  ? [...(project.previousMembers || []), newMember]
                  : project.previousMembers,
                ...(newMember.isLeader && endDate && { leader: undefined })
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
        <h1 className="text-4xl font-bold">Clients and Projects</h1>
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
          onSubmit={handleAddClient}
          onCancel={() => {
            setShowNewClientForm(false);
            setEditingClient(null);
          }}
          editingClient={editingClient || undefined}
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
            onEditTeamMember={(projectId, memberId, endDate) => 
              handleEditTeamMember(client.id, projectId, memberId, endDate)}
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
