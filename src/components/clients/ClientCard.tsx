
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
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
  onRemoveTeamMember
}: ClientCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
      >
        <div>
          <h2 className="text-lg font-medium">{client.name}</h2>
          <p className="text-sm text-muted-foreground">
            {new Date(client.startDate).toLocaleDateString()}
            {client.endDate && ` - ${new Date(client.endDate).toLocaleDateString()}`}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            !client.endDate 
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}>
            {!client.endDate ? "Ativo" : "Inativo"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowNewProjectForm();
            }}
            className="px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors"
          >
            <Plus className="w-5 h-5 inline-block mr-2" />
            Novo Projeto
          </button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t p-4">
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
                  !project.leader
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
