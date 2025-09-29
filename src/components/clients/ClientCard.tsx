import { ChevronDown, ChevronUp, Pencil, Plus } from "lucide-react";
import { Client, Project } from "@/types/clients";
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
  onEditTeamMember: (projectId: string, memberId: string, endDate: string) => void;
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
  onEditTeamMember,
  onEdit,
}: ClientCardProps) => {
  const activeMembers = client.projects.reduce(
    (total, project) => total + project.team.filter((member) => !member.endDate).length,
    0
  );

  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg">
      <div className="rounded-2xl bg-gradient-to-br from-white via-white to-slate-50">
        <div className="flex flex-col gap-6 border-b border-slate-100 p-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-slate-900">{client.name}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                CNPJ {client.cnpj}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  !client.endDate ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {!client.endDate ? "Ativo" : "Inativo"}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
              <span>Início: {new Date(client.startDate).toLocaleDateString()}</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
              <span>Fim: {client.endDate ? new Date(client.endDate).toLocaleDateString() : "Em aberto"}</span>
              {client.projects.length > 0 && (
                <>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
                  <span>
                    {client.projects.length} projeto{client.projects.length > 1 ? "s" : ""}
                  </span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
                  <span>
                    {activeMembers} membro{activeMembers === 1 ? "" : "s"} ativo{activeMembers === 1 ? "" : "s"}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-accent/40 hover:text-accent"
          >
            <Pencil className="h-4 w-4" />
            Editar Cliente
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                {client.projects.length}
              </span>
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {isExpanded ? "Ocultar projetos" : "Exibir projetos"}
                </p>
                <p className="text-sm text-slate-500">
                  {client.projects.length === 0
                    ? "Nenhum projeto cadastrado"
                    : `${client.projects.length} projeto${client.projects.length > 1 ? "s" : ""} vinculados`}
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-accent" />
            ) : (
              <ChevronDown className="h-5 w-5 text-accent" />
            )}
          </button>

          {isExpanded && (
            <div className="space-y-6 border-t border-slate-100 px-6 py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  Registre novos projetos para acompanhar entregas e equipes alocadas.
                </p>
                <button
                  type="button"
                  onClick={onShowNewProjectForm}
                  className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-accent/90"
                >
                  <Plus className="h-4 w-4" />
                  Novo Projeto
                </button>
              </div>

              {showNewProjectForm && (
                <ProjectForm onSubmit={onAddProject} onCancel={onCancelProjectForm} />
              )}

              <div className="space-y-4">
                {client.projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    showTeamForm={showTeamForm === project.id}
                    onShowTeamForm={() => onShowTeamForm(project.id)}
                    onEditTeamMember={(memberId, endDate) => onEditTeamMember(project.id, memberId, endDate)}
                  />
                ))}
                {client.projects.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
                    Nenhum projeto cadastrado ainda. Clique em “Novo Projeto” para começar.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default ClientCard;
