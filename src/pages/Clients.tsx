/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FolderKanban,
  Plus,
  Sparkles,
  UserCircle,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Client, Project, TeamMember } from "@/types/clients";
import ClientForm from "@/components/clients/ClientForm";
import ClientCard from "@/components/clients/ClientCard";
import { supabase } from "@/lib/supabase";

interface ProjectMember {
  id: string;
  start_date: string;
  end_date: string | null;
  role: string;
  is_leader: boolean;
  system_users: {
    id: string;
    name: string;
    email: string;
  };
}

interface Stat {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
}

const normalizeTeamMember = (member: ProjectMember): TeamMember => ({
  id: member.id,
  name: member.system_users.name,
  email: member.system_users.email,
  startDate: member.start_date,
  endDate: member.end_date ?? undefined,
  role: member.role,
  isLeader: member.is_leader,
  isActive: !member.end_date,
});

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState<string | null>(
    null
  );
  const [showTeamForm, setShowTeamForm] = useState<{
    clientId: string;
    projectId: string;
  } | null>(null);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select(`
          *,
          projects (
            id,
            name,
            description,
            start_date,
            end_date
          )
        `);

      if (clientsError) throw clientsError;

      const clientsWithTeams: Client[] = await Promise.all(
        (clientsData ?? []).map(async (client: Client) => {
          const projectsWithTeams: Project[] = await Promise.all(
            (client.projects ?? []).map(async (project: Project) => {
              const { data: teamMembers, error: teamError } = await supabase
                .from("project_members")
                .select(`
                  id,
                  start_date,
                  end_date,
                  role,
                  is_leader,
                  system_users (
                    id,
                    name,
                    email
                  )
                `)
                .eq("project_id", project.id)
                .is("end_date", null);

              if (teamError) throw teamError;
              const normalizedTeam: TeamMember[] = (teamMembers ?? []).map(
                normalizeTeamMember
              );

              const { data: previousMembers, error: previousError } =
                await supabase
                  .from("project_members")
                  .select(`
                    id,
                    start_date,
                    end_date,
                    role,
                    is_leader,
                    system_users (
                      id,
                      name,
                      email
                    )
                  `)
                  .eq("project_id", project.id)
                  .not("end_date", "is", null);

              if (previousError) throw previousError;
              const formattedPreviousMembers: TeamMember[] = (
                previousMembers ?? []
              ).map(normalizeTeamMember);

              const leader = normalizedTeam.find((member) => member.isLeader);

              const formattedProject: Project = {
                id: project.id,
                name: project.name,
                description: project.description,
                startDate: (project as any).start_date ?? project.startDate,
                endDate: (project as any).end_date ?? project.endDate,
                team: normalizedTeam,
                previousMembers: formattedPreviousMembers,
                leader,
              };

              return formattedProject;
            })
          );

          const formattedClient: Client = {
            id: client.id,
            name: client.name,
            cnpj: client.cnpj,
            startDate: (client as any).start_date ?? client.startDate,
            endDate: (client as any).end_date ?? client.endDate,
            projects: projectsWithTeams,
          };

          return formattedClient;
        })
      );

      setClients(clientsWithTeams);
    } catch (error: unknown) {
      console.error("Erro ao carregar clientes:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar clientes",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo<Stat[]>(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((client) => !client.endDate).length;
    const totalProjects = clients.reduce(
      (acc, client) => acc + client.projects.length,
      0
    );
    const activeProjects = clients.reduce(
      (acc, client) =>
        acc + client.projects.filter((project) => !project.endDate).length,
      0
    );
    const completedProjects = clients.reduce(
      (acc, client) =>
        acc + client.projects.filter((project) => project.endDate).length,
      0
    );
    const activeMembers = clients.reduce(
      (acc, client) =>
        acc +
        client.projects.reduce(
          (projectAcc, project) =>
            projectAcc + project.team.filter((member) => !member.endDate).length,
          0
        ),
      0
    );

    return [
      {
        label: "Clientes ativos",
        value: activeClients,
        helper: `${totalClients} cadastrados`,
        icon: Users,
      },
      {
        label: "Projetos em andamento",
        value: activeProjects,
        helper: `${totalProjects} no total`,
        icon: FolderKanban,
      },
      {
        label: "Projetos concluídos",
        value: completedProjects,
        helper: `${completedProjects} entregas finalizadas`,
        icon: Briefcase,
      },
      {
        label: "Membros alocados",
        value: activeMembers,
        helper:
          activeMembers === 1
            ? "1 pessoa na operação"
            : `${activeMembers} pessoas na operação`,
        icon: UserCircle,
      },
    ];
  }, [clients]);

  const handleToggleExpand = (clientId: string) => {
    setExpandedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const toggleProjectForm = (clientId: string) => {
    setShowNewProjectForm((prev) => (prev === clientId ? null : clientId));
  };

  const handleTeamFormToggle = (clientId: string, projectId: string) => {
    setShowTeamForm((prev) =>
      prev?.clientId === clientId && prev.projectId === projectId
        ? null
        : { clientId, projectId }
    );
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowNewClientForm(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-14">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/15 via-white to-white p-8 shadow-sm">
        <div
          className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-accent ring-1 ring-accent/30">
              <Sparkles className="h-4 w-4" /> Visão consolidada
            </span>
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
              Clientes & Projetos
            </h1>
            <p className="text-base text-slate-600">
              Gerencie cadastros, acompanhe o andamento de projetos e visualize
              o envolvimento da equipe em um só lugar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingClient(null);
              setShowNewClientForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/5 transition hover:translate-y-0.5 hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-semibold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-slate-400">
                    {stat.helper}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Formulário Novo Cliente */}
      {(showNewClientForm || editingClient) && (
        <ClientForm
          onSubmit={async (clientData) => {
            if (editingClient) {
              setClients((prev) =>
                prev.map((c) => (c.id === editingClient.id ? clientData : c))
              );
              setEditingClient(null);
            } else {
              setClients((prev) => [...prev, clientData]);
            }
            setShowNewClientForm(false);
            await fetchClients();
          }}
          onCancel={() => {
            setShowNewClientForm(false);
            setEditingClient(null);
          }}
          editingClient={editingClient ?? undefined}
        />
      )}

      {/* Lista de clientes */}
      <div className="grid gap-6">
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            isExpanded={expandedClients.includes(client.id)}
            showNewProjectForm={showNewProjectForm === client.id}
            showTeamForm={
              showTeamForm?.clientId === client.id ? showTeamForm.projectId : null
            }
            onToggleExpand={() => handleToggleExpand(client.id)}
            onShowNewProjectForm={() => toggleProjectForm(client.id)}
            onAddProject={async (project) => {
              setClients((prev) =>
                prev.map((c) =>
                  c.id === client.id
                    ? { ...c, projects: [...c.projects, project] }
                    : c
                )
              );
              setShowNewProjectForm(null);
              await fetchClients();
            }}
            onCancelProjectForm={() => setShowNewProjectForm(null)}
            onShowTeamForm={(projectId) =>
              handleTeamFormToggle(client.id, projectId)
            }
            onEditTeamMember={async (_projectId, memberId, endDate) => {
              try {
                const { error } = await supabase
                  .from("project_members")
                  .update({ end_date: endDate })
                  .eq("id", memberId);
                if (error) throw error;
                await fetchClients();
                toast({
                  title: "Membro atualizado com sucesso",
                  description:
                    "As informações do membro da equipe foram atualizadas.",
                });
              } catch (error: unknown) {
                console.error("Erro ao atualizar membro:", error);
                toast({
                  variant: "destructive",
                  title: "Erro ao atualizar membro",
                  description:
                    error instanceof Error ? error.message : String(error),
                });
              }
            }}
            onEdit={() => handleEditClient(client)}
          />
        ))}
      </div>

      {/* Placeholder vazio */}
      {!clients.length && !showNewClientForm && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white/70 py-16 text-center shadow-sm">
          <div className="rounded-full bg-accent/10 p-4 text-accent">
            <FolderKanban className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">
              Comece cadastrando seu primeiro cliente
            </h2>
            <p className="mx-auto max-w-md text-sm text-slate-500">
              Organize clientes, projetos e equipes com uma visão unificada.
              Clique em “Novo Cliente” para iniciar o controle.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingClient(null);
              setShowNewClientForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        </div>
      )}
    </div>
  );
};

export default Clients;
