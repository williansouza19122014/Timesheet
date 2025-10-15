import { useEffect, useMemo, useState } from "react";
import { Shield, ShieldPlus, Loader2 } from "lucide-react";
import Forbidden from "@/components/auth/Forbidden";
import { usePermission } from "@/hooks/usePermission";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createRole, listRoles, type RoleResponse } from "@/lib/roles-api";

const DEFAULT_PERMISSION_SUGGESTIONS = [
  "projects.create",
  "projects.update",
  "projects.delete",
  "projects.members.manage",
  "clients.create",
  "clients.update",
  "clients.delete",
  "users.list",
  "users.create",
  "users.update",
  "users.delete",
  "roles.list",
  "roles.create",
  "roles.assign",
  "tenant.manage",
  "reports.view",
];

const RolesPermissions = () => {
  const { toast } = useToast();
  const { isAllowed: canListRoles, hasPermission, isMaster } = usePermission("roles.list");
  const canCreateRole = isMaster || hasPermission("roles.create");
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<{ name: string; permissions: string }>({
    name: "",
    permissions: "",
  });

  useEffect(() => {
    const fetchRoles = async () => {
      if (!canListRoles && !isMaster) return;
      setIsLoading(true);
      try {
        const data = await listRoles();
        setRoles(data);
      } catch (error) {
        console.error("Erro ao carregar roles", error);
        toast({
          variant: "destructive",
          title: "Não foi possível carregar as roles",
          description:
            error instanceof Error ? error.message : "Verifique sua conexão e tente novamente.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchRoles();
  }, [canListRoles, isMaster, toast]);

  const suggestions = useMemo(() => DEFAULT_PERMISSION_SUGGESTIONS.sort(), []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreateRole) return;

    const normalizedPermissions = formData.permissions
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setCreating(true);
    try {
      const role = await createRole({
        name: formData.name,
        permissions: normalizedPermissions,
      });
      setRoles((previous) => [...previous, role]);
      setFormData({ name: "", permissions: "" });
      toast({
        title: "Role criada com sucesso",
        description: "Atribua essa role a um usuário para aplicar as permissões.",
      });
    } catch (error) {
      console.error("Erro ao criar role", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar role",
        description:
          error instanceof Error ? error.message : "Não foi possível criar a role. Tente novamente.",
      });
    } finally {
      setCreating(false);
    }
  };

  if (!canListRoles && !isMaster) {
    return <Forbidden />;
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissões</h1>
          <p className="text-sm text-muted-foreground">
            Controle granular de acesso para o tenant. Somente o usuário Master pode criar ou
            atualizar as roles padrão.
          </p>
        </div>
        <div className="rounded-full bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
          Tenant Admin
        </div>
      </header>

      {canCreateRole && (
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
              <ShieldPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Nova role personalizada</h2>
              <p className="text-sm text-muted-foreground">
                Defina um nome e indique as permissões separadas por vírgula.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="role-name" className="text-sm font-medium">
                Nome da role
              </label>
              <Input
                id="role-name"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Ex.: FINANCE_ADMIN"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="role-permissions" className="text-sm font-medium">
                Permissões (separadas por vírgula)
              </label>
              <Input
                id="role-permissions"
                value={formData.permissions}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, permissions: event.target.value }))
                }
                placeholder="projects.create, reports.view"
              />
              <p className="text-xs text-muted-foreground">
                Dica: permissões disponíveis: {suggestions.join(", ")}.
              </p>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar role"}
              </Button>
            </div>
          </form>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Roles do tenant</h2>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center rounded-2xl border bg-muted/30">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {roles.map((role) => (
              <div key={role.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{role.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Atualizado em {new Date(role.updatedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Nenhuma permissão atribuída.</span>
                  ) : (
                    role.permissions.map((permission) => (
                      <Badge key={permission} variant="outline">
                        {permission}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RolesPermissions;
