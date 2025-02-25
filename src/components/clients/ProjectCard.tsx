
import { useState } from "react";
import { Project, TeamMember } from "@/types/clients";
import ProjectTeamForm from "./ProjectTeamForm";
import ProjectTeamMember from "./ProjectTeamMember";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [showCurrentTeam, setShowCurrentTeam] = useState(false);
  const [showPreviousMembers, setShowPreviousMembers] = useState(false);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <h4 className="font-medium">{project.name}</h4>
          <p className="text-sm text-muted-foreground">{project.description}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={`px-2 py-0.5 rounded-full ${
              !project.endDate 
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              Status: {!project.endDate ? "Ativo" : "Inativo"}
            </span>
            <span>|</span>
            <span>
              Data de Início: {project.startDate ? new Date(project.startDate).toLocaleDateString() : "___/___/_____"}
            </span>
            <span>|</span>
            <span>
              Data de Fim: {project.endDate ? new Date(project.endDate).toLocaleDateString() : "___/___/_____"}
            </span>
          </div>
          {project.leader && (
            <p className="text-sm">
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
          <div className="space-y-4">
            <div>
              <h5 className="font-medium mb-2">Adicionar Membro</h5>
              <ProjectTeamForm
                onAddMember={(member) => onAddTeamMember(member)}
                hasLeader={!!project.leader}
              />
            </div>
            
            <div>
              <button
                onClick={() => setShowCurrentTeam(!showCurrentTeam)}
                className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">Equipe Atual</span>
                {showCurrentTeam ? <ChevronUp /> : <ChevronDown />}
              </button>
              {showCurrentTeam && (
                <div className="mt-2 space-y-2">
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
                        isLeader={member.isLeader}
                        onEdit={() => {}} // Temporary empty function until edit functionality is implemented
                        onRemove={() => onRemoveTeamMember(member.id)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {project.previousMembers && project.previousMembers.length > 0 && (
              <div>
                <button
                  onClick={() => setShowPreviousMembers(!showPreviousMembers)}
                  className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Membros Anteriores</span>
                  {showPreviousMembers ? <ChevronUp /> : <ChevronDown />}
                </button>
                {showPreviousMembers && (
                  <div className="mt-2 space-y-2">
                    {project.previousMembers.map(member => (
                      <ProjectTeamMember
                        key={member.id}
                        name={member.name}
                        email={member.email}
                        startDate={member.startDate}
                        endDate={member.endDate}
                        role={member.role}
                        isLeader={member.isLeader}
                        onEdit={() => {}} // Temporary empty function until edit functionality is implemented
                        onRemove={() => onRemoveTeamMember(member.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
