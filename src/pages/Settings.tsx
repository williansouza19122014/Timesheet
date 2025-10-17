import { useMemo, useState, useEffect, useCallback } from "react";
import { ShieldPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useAccessControl,
  type FeatureDefinition,
  type FeatureKey,
  type RoleDefinition,
} from "@/context/access-control-context";
import TenantSettings from "@/pages/admin/TenantSettings";
import Users from "@/pages/Users";
import HolidaySettings from "@/components/settings/HolidaySettings";
import { useAuth } from "@/hooks/useAuth";
import {
  loadPreferences,
  savePreferences,
  type PreferencesState,
} from "@/utils/preferences-storage";

// ✅ Declaração do tipo ausente
type FeatureGroups = Record<string, FeatureDefinition[]>;

const groupFeatures = (features: FeatureDefinition[]): FeatureGroups =>
  features.reduce<FeatureGroups>((groups, feature) => {
    const groupName = feature.group;
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(feature);
    return groups;
  }, {});

const Settings = () => {
  const [preferences, setPreferences] = useState<PreferencesState>(() =>
    loadPreferences()
  );

  const handlePreferenceChange = (
    key: keyof PreferencesState,
    value: boolean | number
  ) => {
    const next = {
      ...preferences,
      [key]: value,
    };
    setPreferences(next);
    savePreferences(next);
  };

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Configurações
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Centralize configurações gerais, permissões e administração do tenant
          em um único painel.
        </p>
      </header>

      {/* ✅ Corrigido fechamento de Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white/80 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="roles">Roles &amp; permissões</TabsTrigger>
          <TabsTrigger value="holidays">Feriados</TabsTrigger>
          <TabsTrigger value="tenant">Tenant</TabsTrigger>
          <TabsTrigger value="admins">Usuários master</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralPreferences
            preferences={preferences}
            onPreferenceChange={handlePreferenceChange}
          />
        </TabsContent>

        <TabsContent value="roles">
          <RolesPermissionsTab />
        </TabsContent>

        <TabsContent value="holidays">
          <HolidaySettings />
        </TabsContent>

        <TabsContent value="tenant">
          <TenantSettings />
        </TabsContent>

        <TabsContent value="admins">
          <Users />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const GeneralPreferences = ({
  preferences,
  onPreferenceChange,
}: {
  preferences: PreferencesState;
  onPreferenceChange: (
    key: keyof PreferencesState,
    value: boolean | number
  ) => void;
}) => {
  const alertOptions = [15, 30, 45, 60, 90];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Preferências do workspace
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ajuste automações e alertas que impactam todos os usuários do tenant.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PreferenceCard
          title="Resumo semanal por e-mail"
          description="Enviar um consolidado das horas trabalhadas toda segunda-feira."
          checked={preferences.weeklySummary}
          onChange={(checked) => onPreferenceChange("weeklySummary", checked)}
        />

        <PreferenceCard
          title="Lembrete de registro no desktop"
          description="Alertar quando nenhum ponto for registrado até 10h."
          checked={preferences.desktopReminders}
          onChange={(checked) => onPreferenceChange("desktopReminders", checked)}
        />

        <PreferenceCard
          title="Notificações de aprovação"
          description="Avisar sempre que houver aprovação ou recusa de solicitação."
          checked={preferences.notifyApprovals}
          onChange={(checked) => onPreferenceChange("notifyApprovals", checked)}
        />

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="max-w-md">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Alerta de férias próximas do vencimento
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Defina com quantos dias de antecedência o sistema deve avisar
              sobre prazos críticos.
            </p>
          </div>

          <Select
            value={preferences.vacationAlertThreshold.toString()}
            onValueChange={(value) =>
              onPreferenceChange("vacationAlertThreshold", Number(value))
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {alertOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option} dias
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
};

const PreferenceCard = ({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="max-w-md">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

const EMPLOYEES_STORAGE_KEY = "tempEmployees";

const RolesPermissionsTab = () => {
  const {
    roleDefinitions,
    features,
    accessMap,
    setFeatureAccess,
    resetToDefault,
    createRole,
    deleteRole,
    updateRole,
  } = useAccessControl();

  const { isMaster } = useAuth();
  const { toast } = useToast();
  const canManageRoles = isMaster;

  const defaultRoleId =
    roleDefinitions.find((role) => role.id === "user")?.id ??
    roleDefinitions[0]?.id ??
    "";

  const featureKeys = useMemo(() => features.map((f) => f.key), [features]);

  const computeRoleUsage = useCallback(() => {
    try {
      const raw = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      const list: Array<{ accessRole?: string }> = raw ? JSON.parse(raw) : [];
      const usage = list.reduce<Record<string, number>>((acc, emp) => {
        const roleId = emp.accessRole || defaultRoleId;
        if (roleId) acc[roleId] = (acc[roleId] ?? 0) + 1;
        return acc;
      }, {});
      roleDefinitions.forEach((r) => {
        if (usage[r.id] === undefined) usage[r.id] = 0;
      });
      return usage;
    } catch {
      return roleDefinitions.reduce<Record<string, number>>((acc, r) => {
        acc[r.id] = 0;
        return acc;
      }, {});
    }
  }, [defaultRoleId, roleDefinitions]);

  const [roleUsage, setRoleUsage] = useState<Record<string, number>>(() =>
    computeRoleUsage()
  );

  const refreshRoleUsage = useCallback(
    () => setRoleUsage(computeRoleUsage()),
    [computeRoleUsage]
  );

  useEffect(() => {
    refreshRoleUsage();
  }, [refreshRoleUsage]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === EMPLOYEES_STORAGE_KEY) refreshRoleUsage();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refreshRoleUsage]);

  const [editingRole, setEditingRole] = useState<{
    role: RoleDefinition;
    name: string;
    description: string;
    features: Set<FeatureKey>;
  } | null>(null);

  const openEditRole = (role: RoleDefinition) => {
    const enabled = new Set<FeatureKey>(
      featureKeys.filter((key) => Boolean(accessMap[role.id]?.[key]))
    );
    setEditingRole({
      role,
      name: role.name,
      description: role.description ?? "",
      features: enabled,
    });
  };

  const closeEditRole = () => setEditingRole(null);

  const toggleEditFeature = (feature: FeatureKey, enabled: boolean) => {
    setEditingRole((prev) => {
      if (!prev) return prev;
      const next = new Set(prev.features);
      enabled ? next.add(feature) : next.delete(feature);
      return { ...prev, features: next };
    });
  };

  const handleSaveRole = () => {
    if (!editingRole) return;
    if (!canManageRoles)
      return toast({
        variant: "destructive",
        title: "Acesso restrito",
        description: "Somente o usuário Master pode editar perfis.",
      });

    const trimmed = editingRole.name.trim();
    if (!trimmed)
      return toast({
        variant: "destructive",
        title: "Informe um nome válido.",
      });

    updateRole(editingRole.role.id, {
      name: trimmed,
      description: editingRole.description.trim() || undefined,
    });

    // ✅ Corrigido para 3 argumentos
    featureKeys.forEach((key) =>
      setFeatureAccess(
        editingRole.role.id,
        key,
        editingRole.features.has(key)
      )
    );

    toast({
      title: "Perfil atualizado",
      description: "As permissões foram aplicadas com sucesso.",
    });
    closeEditRole();
  };

  return (
    <div>
      <Dialog open={Boolean(editingRole)} onOpenChange={(o) => !o && closeEditRole()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar perfil de acesso</DialogTitle>
            <DialogDescription>
              Ajuste o nome, descrição e permissões deste perfil.
            </DialogDescription>
          </DialogHeader>

          {editingRole && (
            <div className="space-y-4">
              <Label htmlFor="edit-role-name">Nome</Label>
              <Input
                id="edit-role-name"
                value={editingRole.name}
                onChange={(e) =>
                  setEditingRole((p) =>
                    p ? { ...p, name: e.target.value } : p
                  )
                }
                disabled={!canManageRoles}
              />

              <Label htmlFor="edit-role-description">Descrição</Label>
              <Input
                id="edit-role-description"
                value={editingRole.description}
                onChange={(e) =>
                  setEditingRole((p) =>
                    p ? { ...p, description: e.target.value } : p
                  )
                }
                disabled={!canManageRoles}
              />
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeEditRole}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRole} disabled={!canManageRoles}>
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ✅ Corrigido tipo e adicionado `disabled`
const Input = ({
  id,
  value,
  onChange,
  placeholder,
  required,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) => (
  <input
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
  />
);

export default Settings;
