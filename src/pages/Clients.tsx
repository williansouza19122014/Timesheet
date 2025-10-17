import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Briefcase, FolderKanban, Plus, UserCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Client, Project } from "@/types/clients";
import { Button } from "@/components/ui/button";
import ClientForm, { type ClientFormValues } from "@/components/clients/ClientForm";
import ClientCard from "@/components/clients/ClientCard";
import { useClients } from "@/hooks/useClients";
import { apiFetch } from "@/lib/api-client";
import { createProject } from "@/lib/projects-api";

interface Stat {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
}

const Clients = () => {
  const { clients, refresh, loading } = useClients();
  const { toast } = useToast();

  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState<string | null>(null);
  const [showTeamForm, setShowTeamForm] = useState<{ clientId: string; projectId: string } | null>(null);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const [submittingClient, setSubmittingClient] = useState(false);

  const stats = useMemo<Stat[]>(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((client) => !client.endDate).length;
    const totalProjects = clients.reduce((acc, client) => acc + client.projects.length, 0);
    const activeProjects = clients.reduce(
      (acc, client) => acc + client.projects.filter((project) => !project.endDate).length,
      0
    );
    const completedProjects = clients.reduce(
      (acc, client) => acc + client.projects.filter((project) => project.endDate).length,
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
        label: "Projetos concluidos",
        value: completedProjects,
        helper: `${completedProjects} entregas finalizadas`,
        icon: Briefcase,
      },
      {
        label: "Membros alocados",
        value: activeMembers,
        helper:
          activeMembers === 1
            ? "1 pessoa na operacao"
            : `${activeMembers} pessoas na operacao`,
        icon: UserCircle,
      },
    ];
  }, [clients]);

  const handleToggleExpand = (clientId: string) => {
    setExpandedClients((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const toggleProjectForm = (clientId: string) => {
    setShowNewProjectForm((prev) => (prev === clientId ? null : clientId));
  };

  const handleTeamFormToggle = (clientId: string, projectId: string) => {
    setShowTeamForm((prev) =>
      prev?.clientId === clientId && prev.projectId === projectId ? null : { clientId, projectId }
    );
  };

  const openCreateClientModal = () => {
    setEditingClient(null);
    setShowNewClientForm(true);
  };

  const openEditClientModal = (client: Client) => {
    setEditingClient(client);
    setShowNewClientForm(true);
  };

  const closeClientModal = () => {
    setEditingClient(null);
    setShowNewClientForm(false);
  };

  const handleClientSubmit = async (values: ClientFormValues) => {
    try {
      setSubmittingClient(true);
      const payload = {
        name: values.name,
        cnpj: values.cnpj,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
      };

      await apiFetch(editingClient ? `/api/clients/${editingClient.id}` : "/api/clients", {
        method: editingClient ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      toast({
        title: editingClient ? "Cliente atualizado" : "Cliente criado",
        description: `${values.name} foi salvo com sucesso`,
      });

      await refresh();
      closeClientModal();
    } catch (error) {
      console.error("Erro ao salvar cliente", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar cliente",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSubmittingClient(false);
    }
  };

  const handleAddProject = async (clientId: string, project: Project) => {
    try {
      await createProject({
        clientId,
        name: project.name,
        description: project.description,
        startDate: project.startDate || undefined,
        endDate: project.endDate || undefined,
      });

      toast({
        title: "Projeto cadastrado",
        description: `${project.name} foi criado com sucesso.`,
      });

      setShowNewProjectForm(null);
      await refresh();
    } catch (error) {
      console.error("Erro ao cadastrar projeto", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar projeto",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
    }
  };

  const handleEditTeamMember = async (
    _projectId: string,
    _memberId: string,
    _endDate: string
  ) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A edicao de membros de projeto ainda nao esta disponivel.",
    });
  };

  return (
    <div className="animate-fade-in space-y-6 pb-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Clientes & Projetos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie cadastros, acompanhe o andamento de projetos e visualize o envolvimento da equipe em um s\u00F3 lugar.
          </p>
        </div>
        <Button type="button" onClick={openCreateClientModal} className="rounded-full px-5">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group flex flex-col rounded-3xl border border-slate-200/70 bg-gradient-to-b from-white/90 to-white/60 p-5 shadow-lg backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/70 dark:from-[#101827] dark:to-[#0f172a]"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-accent/10 p-3 text-accent transition group-hover:bg-accent/20">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{stat.value}</p>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{stat.helper}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {(showNewClientForm || editingClient) && (
        <ClientForm
          mode={editingClient ? "edit" : "create"}
          initialValues={{
            name: editingClient?.name ?? "",
            cnpj: editingClient?.cnpj ?? "",
            startDate: editingClient?.startDate ?? new Date().toISOString().split("T")[0],
            endDate: editingClient?.endDate ?? "",
          }}
          submitting={submittingClient}
          onSubmit={handleClientSubmit}
          onCancel={closeClientModal}
        />
      )}

      <div className="space-y-5">
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            isExpanded={expandedClients.includes(client.id)}
            showNewProjectForm={showNewProjectForm === client.id}
            showTeamForm={showTeamForm?.clientId === client.id ? showTeamForm.projectId : null}
            onToggleExpand={() => handleToggleExpand(client.id)}
            onShowNewProjectForm={() => toggleProjectForm(client.id)}
            onAddProject={(project) => handleAddProject(client.id, project)}
            onCancelProjectForm={() => setShowNewProjectForm(null)}
            onShowTeamForm={(projectId) => handleTeamFormToggle(client.id, projectId)}
            onEditTeamMember={(_, memberId, endDate) => handleEditTeamMember(client.id, memberId, endDate)}
            onEdit={() => openEditClientModal(client)}
          />
        ))}

        {!clients.length && !loading && !showNewClientForm && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-white/80 py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <div className="rounded-full bg-accent/10 p-4 text-accent">
              <FolderKanban className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Comece cadastrando seu primeiro cliente
              </h2>
              <p className="mx-auto max-w-md text-sm text-slate-500 dark:text-slate-400">
                Organize clientes, projetos e equipes com uma vis\u00E3o unificada. Clique em \"Novo Cliente\" para iniciar o controle.
              </p>
            </div>
            <Button type="button" onClick={openCreateClientModal} className="rounded-full px-5">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
