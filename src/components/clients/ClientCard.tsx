
import { ChevronDown, ChevronUp, Plus, Pencil } from "lucide-react";
import { Client, Project, TeamMember } from "@/types/clients";
import ProjectCard from "./ProjectCard";
import ProjectForm from "./ProjectForm";

interface ClientCardProps {
  client: Client;
  isExpanded: boolean;
  showNewProjectForm: boolean;
  showTeamForm: string | null;
  onToggleExpand: () => void;
  onShowNewProjectForm: () => void;
  onAddProject: (project: Project) => void;
  onCancelProjectForm: () => void;
  onShowTeamForm: (projectId: string) => void;
  onAddTeamMember: (projectId: string, member: TeamMember, isLeader: boolean) => void;
  onRemoveTeamMember: (projectId: string, memberId: string) => void;
  onEdit: () => void;
}

const ClientCard = ({
  client,
  isExpanded,
  showNewProjectForm,
  showTeamForm,
  onToggleExpand,
  onShowNewProjectForm,
  onAddProject,
  onCancelProjectForm,
  onShowTeamForm,
  onAddTeamMember,
  onRemoveTeamMember,
  onEdit
}: ClientCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium">{client.name}</h2>
            <p className="text-sm text-muted-foreground">CNPJ: {client.cnpj}</p>
          </div>
          <button
            onClick={onEdit}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            !client.endDate 
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}>
            Status: {!client.endDate ? "Ativo" : "Inativo"}
          </span>
          <span>|</span>
          <span>
            Data de Início: {new Date(client.startDate).toLocaleDateString()}
          </span>
          <span>|</span>
          <span>
            Data de Fim: {client.endDate ? new Date(client.endDate).toLocaleDateString() : "___/___/_____"}
          </span>
        </div>
      </div>
      
      <div 
        className="flex items-center justify-between p-4 border-t cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
      >
        <span className="text-sm font-medium">
          {isExpanded ? "Ocultar projetos" : "Exibir projetos"}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </div>

      {isExpanded && (
        <div className="border-t p-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={onShowNewProjectForm}
              className="px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors"
            >
              <Plus className="w-5 h-5 inline-block mr-2" />
              Novo Projeto
            </button>
          </div>

          {showNewProjectForm && (
            <ProjectForm
              onSubmit={onAddProject}
              onCancel={onCancelProjectForm}
            />
          )}

          <div className="space-y-4">
            {client.projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                showTeamForm={showTeamForm === project.id}
                onShowTeamForm={() => onShowTeamForm(project.id)}
                onAddTeamMember={(member) => onAddTeamMember(
                  project.id,
                  member,
                  !project.leader && member.isLeader
                )}
                onRemoveTeamMember={(memberId) => onRemoveTeamMember(project.id, memberId)}
              />
            ))}
            {client.projects.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum projeto cadastrado</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCard;
