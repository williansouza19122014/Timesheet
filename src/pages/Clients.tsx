
import { useState } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProjectTeamForm from "@/components/clients/ProjectTeamForm";
import ProjectTeamMember from "@/components/clients/ProjectTeamMember";
import { Client, Project, TeamMember } from "@/types/clients";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState<string | null>(null);
  const [showTeamForm, setShowTeamForm] = useState<{clientId: string, projectId: string} | null>(null);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleClientExpansion = (clientId: string) => {
    setExpandedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      projects: []
    };

    setClients(prev => [...prev, newClient]);
    setShowNewClientForm(false);
    toast({
      title: "Cliente adicionado",
      description: `${newClient.name} foi adicionado com sucesso`
    });
  };

  const handleAddProject = (clientId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: formData.get("projectName") as string,
      description: formData.get("description") as string,
      team: []
    };

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
    toast({
      title: "Projeto adicionado",
      description: `${newProject.name} foi adicionado com sucesso`
    });
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

    toast({
      title: "Membro adicionado",
      description: `${member.name} foi adicionado à equipe${isLeader ? ' como líder' : ''}`
    });
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

    toast({
      title: "Membro removido",
      description: "Membro removido da equipe com sucesso"
    });
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
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <h2 className="text-xl font-medium mb-4">Novo Cliente</h2>
          <form onSubmit={handleAddClient} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                name="name"
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                name="phone"
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewClientForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {clients.map(client => (
          <div key={client.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleClientExpansion(client.id)}
            >
              <div>
                <h2 className="text-lg font-medium">{client.name}</h2>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNewProjectForm(client.id);
                  }}
                  className="px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors"
                >
                  Novo Projeto
                </button>
                {expandedClients.includes(client.id) ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </div>

            {expandedClients.includes(client.id) && (
              <div className="border-t p-4">
                {showNewProjectForm === client.id && (
                  <div className="border rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-medium mb-4">Novo Projeto</h3>
                    <form onSubmit={(e) => handleAddProject(client.id, e)} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nome do Projeto</label>
                        <input
                          name="projectName"
                          required
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <textarea
                          name="description"
                          required
                          className="w-full p-2 border rounded-lg"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNewProjectForm(null)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                        >
                          Salvar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {client.projects.map(project => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                          {project.leader && (
                            <p className="text-sm mt-1">
                              Líder: <span className="font-medium">{project.leader.name}</span>
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => setShowTeamForm({ clientId: client.id, projectId: project.id })}
                          className="px-3 py-1 text-sm border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors"
                        >
                          Gerenciar Equipe
                        </button>
                      </div>

                      {showTeamForm?.clientId === client.id && showTeamForm?.projectId === project.id && (
                        <div className="border-t pt-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium mb-2">Adicionar Membro</h5>
                              <ProjectTeamForm
                                onAddMember={(member) => handleAddTeamMember(
                                  client.id,
                                  project.id,
                                  member,
                                  !project.leader // If no leader exists, make this member the leader
                                )}
                              />
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">Equipe Atual</h5>
                              <div className="space-y-2">
                                {project.team.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">Nenhum membro na equipe</p>
                                ) : (
                                  project.team.map(member => (
                                    <ProjectTeamMember
                                      key={member.id}
                                      name={member.name}
                                      email={member.email}
                                      startDate={member.startDate}
                                      endDate={member.endDate}
                                      role={member.role}
                                      onRemove={() => handleRemoveTeamMember(client.id, project.id, member.id)}
                                    />
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {client.projects.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum projeto cadastrado</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clients;
