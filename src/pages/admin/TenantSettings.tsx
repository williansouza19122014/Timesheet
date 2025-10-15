import { useState } from "react";
import { Building2, Crown, Loader2 } from "lucide-react";
import Forbidden from "@/components/auth/Forbidden";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const TenantSettings = () => {
  const { user, tenantId } = useAuth();
  const { toast } = useToast();
  const { isAllowed: canManageTenant, isMaster } = usePermission("tenant.manage");
  const [formState, setFormState] = useState({
    tenantName: user?.tenantId ? `Tenant ${user.tenantId.slice(0, 6)}` : "",
    plan: "FREE",
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!canManageTenant && !isMaster) {
    return <Forbidden />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      // TODO: Integrar com endpoint PATCH /api/tenant quando disponível
      await new Promise((resolve) => setTimeout(resolve, 900));
      toast({
        title: "Configurações atualizadas",
        description: "As informações serão sincronizadas com o backend quando disponível.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-3 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/40 text-accent">
          <Crown className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Configurações do Tenant</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie informações sensíveis do workspace. Apenas o usuário Master tem acesso a estas
            opções.
          </p>
        </div>
      </header>

      <section className="rounded-3xl border bg-card p-6 shadow-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="tenant-name" className="text-sm font-medium text-muted-foreground">
              Nome da empresa
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="tenant-name"
                value={formState.tenantName}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, tenantName: event.target.value }))
                }
                className="pl-10"
                placeholder="Digite o nome oficial da empresa"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Utilizado em relatórios, telas administrativas e na emissão de notificações internas.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="tenant-plan" className="text-sm font-medium text-muted-foreground">
              Plano atual
            </label>
            <Input
              id="tenant-plan"
              value={formState.plan}
              onChange={(event) => setFormState((prev) => ({ ...prev, plan: event.target.value }))}
              placeholder="FREE | PRO | ENTERPRISE"
            />
            <p className="text-xs text-muted-foreground">
              Ajuste reservado ao time financeiro. A troca impacta limites de usuários e recursos.
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Informações técnicas</span>
            <dl className="grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide">Tenant ID</dt>
                <dd className="font-mono text-xs text-foreground/80">{tenantId ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Master</dt>
                <dd className="font-medium text-foreground">{user?.email}</dd>
              </div>
            </dl>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border bg-muted/40 p-6 text-sm text-muted-foreground">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Próximos passos</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            Integrar com os endpoints de gerenciamento de tenants (PUT /api/tenants/:id) para
            persistir alterações.
          </li>
          <li>
            Exibir histórico de upgrades de plano com base no billing do tenant e enviar notificações
            automáticas.
          </li>
          <li>
            Permitir exportar dados de configuração em formato JSON para auditoria.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default TenantSettings;
