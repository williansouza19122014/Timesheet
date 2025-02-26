
import { useState } from "react";
import { Project, TeamMember } from "@/types/clients";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectCardProps {
  project: Project;
  showTeamForm: boolean;
  onShowTeamForm: () => void;
  onEditTeamMember: (memberId: string, endDate: string) => void;
}

const ProjectCard = ({
  project,
  showTeamForm,
  onShowTeamForm,
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
              Data de Início: {project.startDate ? format(new Date(project.startDate), 'dd/MM/yyyy', { locale: ptBR }) : "___/___/_____"}
            </span>
            <span>|</span>
            <span>
              Data de Fim: {project.endDate ? format(new Date(project.endDate), 'dd/MM/yyyy', { locale: ptBR }) : "___/___/_____"}
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
        <span className="font-medium">Visualizar Equipe</span>
        {showTeamForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {showTeamForm && (
        <div className="border-t p-4">
          <div className="space-y-4">
            <div>
              <button
                onClick={() => setShowCurrentTeam(!showCurrentTeam)}
                className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">Equipe Atual ({activeMembers.length})</span>
                {showCurrentTeam ? <ChevronUp /> : <ChevronDown />}
              </button>
              {showCurrentTeam && (
                <div className="mt-4 space-y-4">
                  {activeMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum membro ativo na equipe</p>
                  ) : (
                    activeMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Função: {member.role}
                            {member.isLeader && (
                              <Badge className="ml-2" variant="secondary">Líder</Badge>
                            )}
                          </p>
                        </div>
                        <div className="text-sm text-right text-muted-foreground">
                          <p>Início: {format(new Date(member.startDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                        </div>
                      </div>
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
                  <div className="mt-4 space-y-4">
                    {inactiveMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Função: {member.role}
                            {member.isLeader && (
                              <Badge className="ml-2" variant="secondary">Líder</Badge>
                            )}
                          </p>
                        </div>
                        <div className="text-sm text-right text-muted-foreground">
                          <p>Início: {format(new Date(member.startDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                          {member.endDate && (
                            <p>Fim: {format(new Date(member.endDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                          )}
                        </div>
                      </div>
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
