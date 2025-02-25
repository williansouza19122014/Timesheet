
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
  onEditTeamMember: (memberId: string, endDate: string) => void;
}

const ProjectCard = ({
  project,
  showTeamForm,
  onShowTeamForm,
  onAddTeamMember,
  onEditTeamMember
}: ProjectCardProps) => {
  const [showCurrentTeam, setShowCurrentTeam] = useState(false);
  const [showPreviousMembers, setShowPreviousMembers] = useState(false);

  const activeMembers = project.team.filter(member => !member.endDate);
  const inactiveMembers = [
    ...(project.team.filter(member => member.endDate) || []),
    ...(project.previousMembers || [])
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4">
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
      </div>

      <button
        onClick={onShowTeamForm}
        className="w-full flex items-center justify-between p-4 border-t hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium">Gerenciar Equipe</span>
        {showTeamForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {showTeamForm && (
        <div className="border-t p-4">
          <div className="space-y-4">
            <div>
              <h5 className="font-medium mb-2">Adicionar Membro</h5>
              <ProjectTeamForm
                onAddMember={onAddTeamMember}
                hasLeader={!!project.leader}
              />
            </div>
            
            <div>
              <button
                onClick={() => setShowCurrentTeam(!showCurrentTeam)}
                className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">Equipe Atual ({activeMembers.length})</span>
                {showCurrentTeam ? <ChevronUp /> : <ChevronDown />}
              </button>
              {showCurrentTeam && (
                <div className="mt-2 space-y-2">
                  {activeMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum membro ativo na equipe</p>
                  ) : (
                    activeMembers.map(member => (
                      <ProjectTeamMember
                        key={member.id}
                        id={member.id}
                        name={member.name}
                        email={member.email}
                        startDate={member.startDate}
                        endDate={member.endDate}
                        role={member.role}
                        isLeader={member.isLeader}
                        onEdit={onEditTeamMember}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {inactiveMembers.length > 0 && (
              <div>
                <button
                  onClick={() => setShowPreviousMembers(!showPreviousMembers)}
                  className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Membros Anteriores ({inactiveMembers.length})</span>
                  {showPreviousMembers ? <ChevronUp /> : <ChevronDown />}
                </button>
                {showPreviousMembers && (
                  <div className="mt-2 space-y-2">
                    {inactiveMembers.map(member => (
                      <ProjectTeamMember
                        key={member.id}
                        id={member.id}
                        name={member.name}
                        email={member.email}
                        startDate={member.startDate}
                        endDate={member.endDate}
                        role={member.role}
                        isLeader={member.isLeader}
                        onEdit={onEditTeamMember}
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
