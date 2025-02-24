
import { Project, TeamMember } from "@/types/clients";
import ProjectTeamForm from "./ProjectTeamForm";
import ProjectTeamMember from "./ProjectTeamMember";

interface ProjectCardProps {
  project: Project;
  showTeamForm: boolean;
  onShowTeamForm: () => void;
  onAddTeamMember: (member: TeamMember) => void;
  onRemoveTeamMember: (memberId: string) => void;
}

const ProjectCard = ({
  project,
  showTeamForm,
  onShowTeamForm,
  onAddTeamMember,
  onRemoveTeamMember
}: ProjectCardProps) => {
  return (
    <div className="border rounded-lg p-4">
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
          onClick={onShowTeamForm}
          className="px-3 py-1 text-sm border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors"
        >
          Gerenciar Equipe
        </button>
      </div>

      {showTeamForm && (
        <div className="border-t pt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">Adicionar Membro</h5>
              <ProjectTeamForm
                onAddMember={(member) => onAddTeamMember(member)}
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
                      onRemove={() => onRemoveTeamMember(member.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
