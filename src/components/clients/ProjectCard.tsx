import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/clients";

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
  onEditTeamMember,
}: ProjectCardProps) => {
  const [showCurrentTeam, setShowCurrentTeam] = useState(true);
  const [showPreviousMembers, setShowPreviousMembers] = useState(false);

  const activeMembers = project.team.filter((member) => !member.endDate);
  const inactiveMembers = [
    ...(project.team.filter((member) => member.endDate) || []),
    ...(project.previousMembers || []),
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/75 shadow-sm transition hover:border-accent/30 hover:shadow-md">
      <div className="space-y-4 border-b border-slate-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-xl font-semibold text-slate-900">{project.name}</h4>
            {project.description && (
              <p className="mt-1 text-sm text-slate-600">{project.description}</p>
            )}
          </div>
          <Badge
            variant="outline"
            className={!project.endDate ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600"}
          >
            {!project.endDate ? "Em andamento" : "Concluído"}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
          <span>
            Início: {project.startDate
              ? format(new Date(project.startDate), "dd/MM/yyyy", { locale: ptBR })
              : "Não informado"}
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>
            Fim: {project.endDate
              ? format(new Date(project.endDate), "dd/MM/yyyy", { locale: ptBR })
              : "Em aberto"}
          </span>
          {project.leader && (
            <>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>
                Líder: <span className="font-semibold text-slate-700">{project.leader.name}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onShowTeamForm}
        className="flex w-full items-center justify-between gap-2 px-6 py-4 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
      >
        <span>Visualizar equipe</span>
        {showTeamForm ? <ChevronUp className="h-5 w-5 text-accent" /> : <ChevronDown className="h-5 w-5 text-accent" />}
      </button>

      {showTeamForm && (
        <div className="space-y-6 border-t border-slate-100 bg-slate-50/70 px-6 py-6">
          <div>
            <button
              type="button"
              onClick={() => setShowCurrentTeam((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-accent/40 hover:bg-slate-50"
            >
              <span>Equipe Atual ({activeMembers.length})</span>
              {showCurrentTeam ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showCurrentTeam && (
              <div className="mt-4 grid gap-4">
                {activeMembers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white/80 p-4 text-sm text-slate-500">
                    Nenhum membro ativo na equipe.
                  </div>
                ) : (
                  activeMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            {member.role}
                          </span>
                          {member.isLeader && (
                            <Badge variant="secondary" className="bg-accent/10 text-accent">
                              Líder
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        <p>Início: {format(new Date(member.startDate), "dd/MM/yyyy", { locale: ptBR })}</p>
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
                type="button"
                onClick={() => setShowPreviousMembers((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-accent/40 hover:bg-slate-50"
              >
                <span>Membros Anteriores ({inactiveMembers.length})</span>
                {showPreviousMembers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showPreviousMembers && (
                <div className="mt-4 grid gap-4">
                  {inactiveMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            {member.role}
                          </span>
                          {member.isLeader && (
                            <Badge variant="secondary" className="bg-accent/10 text-accent">
                              Líder
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        <p>Início: {format(new Date(member.startDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                        {member.endDate && (
                          <p>Fim: {format(new Date(member.endDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProjectCard;
