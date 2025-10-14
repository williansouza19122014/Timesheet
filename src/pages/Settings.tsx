import { useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useAccessControl,
  ROLE_LABELS,
  ACCESS_ROLES,
  type FeatureDefinition,
  type FeatureKey,
  type Role,
} from "@/context/access-control-context";
import { cn } from "@/lib/utils";

type PreferenceKey = "weeklySummary" | "desktopReminders" | "notifyApprovals";

const Settings = () => {
  const { toast } = useToast();
  const {
    features,
    roles,
    setFeatureAccess,
    isFeatureEnabled,
    activeRole,
    setActiveRole,
    resetToDefault,
  } = useAccessControl();

  const [preferences, setPreferences] = useState({
    weeklySummary: true,
    desktopReminders: false,
    notifyApprovals: true,
  });

  const groupedFeatures = useMemo(() => {
    return features.reduce<Record<string, FeatureDefinition[]>>((groups, feature) => {
      const groupName = feature.group;
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(feature);
      return groups;
    }, {});
  }, [features]);

  const featureMap = useMemo(
    () => new Map(features.map((feature) => [feature.key, feature])),
    [features]
  );

  const handleAccessChange = (role: Role, feature: FeatureKey, enabled: boolean) => {
    setFeatureAccess(role, feature, enabled);
    const featureInfo = featureMap.get(feature);
    toast({
      title: "Permissão atualizada",
      description: `${ROLE_LABELS[role]} ${enabled ? "agora pode" : "não pode"} acessar ${
        featureInfo?.label ?? feature
      }.`,
    });
  };

  const handlePreferenceChange = (key: PreferenceKey) => (checked: boolean) => {
    setPreferences((previous) => ({ ...previous, [key]: checked }));
    toast({
      title: "Preferência atualizada",
      description: checked ? "Configuração ativada com sucesso." : "Configuração desativada.",
    });
  };

  return (
    <div className="animate-fade-in space-y-10 pb-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground dark:text-slate-400">
          Personalize a experiência do Timesheet e defina quais funcionalidades cada perfil pode acessar.
        </p>
      </header>

      <AccessControlSection
        groups={groupedFeatures}
        roles={roles}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onToggle={handleAccessChange}
        onReset={resetToDefault}
        isFeatureEnabled={isFeatureEnabled}
      />

      <PreferencesSection preferences={preferences} onPreferenceChange={handlePreferenceChange} />
    </div>
  );
};

type AccessControlSectionProps = {
  groups: Record<string, FeatureDefinition[]>;
  roles: Role[];
  activeRole: Role;
  onRoleChange: (role: Role) => void;
  onToggle: (role: Role, feature: FeatureKey, enabled: boolean) => void;
  onReset: () => void;
  isFeatureEnabled: (role: Role, feature: FeatureKey) => boolean;
};

const AccessControlSection = ({
  groups,
  roles,
  activeRole,
  onRoleChange,
  onToggle,
  onReset,
  isFeatureEnabled,
}: AccessControlSectionProps) => {
  const groupEntries = Object.entries(groups);

  if (groupEntries.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Controle de acesso</h2>
          <p className="text-sm text-muted-foreground dark:text-slate-400">
            Defina quais menus ficam visíveis para cada perfil. As alterações são aplicadas imediatamente.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Visualizar como
            </Label>
            <Select value={activeRole} onValueChange={(value) => onRoleChange(value as Role)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={onReset}>
            Restaurar padrão
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {groupEntries.map(([groupName, featureList]) => (
          <div
            key={groupName}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="border-b border-slate-200/70 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                {groupName}
              </h3>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {featureList.map((feature) => {
                const disabledForActiveRole = !isFeatureEnabled(activeRole, feature.key);
                return (
                  <div
                    key={feature.key}
                    className={cn(
                      "grid gap-4 px-6 py-4 md:grid-cols-[minmax(0,1fr)_repeat(3,140px)]",
                      disabledForActiveRole && "bg-muted/40 dark:bg-slate-900/50"
                    )}
                  >
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {feature.label}
                      </p>
                      <p className="text-sm text-muted-foreground dark:text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                    {roles.map((role) => (
                      <div
                        key={`${feature.key}-${role}`}
                        className="flex items-center justify-end gap-3"
                      >
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          {ROLE_LABELS[role]}
                        </span>
                        <Switch
                          checked={isFeatureEnabled(role, feature.key)}
                          onCheckedChange={(checked) => onToggle(role, feature.key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const PreferencesSection = ({
  preferences,
  onPreferenceChange,
}: {
  preferences: Record<PreferenceKey, boolean>;
  onPreferenceChange: (key: PreferenceKey) => (checked: boolean) => void;
}) => (
  <section className="space-y-4">
    <div>
      <h2 className="text-xl font-semibold tracking-tight">Preferências</h2>
      <p className="text-sm text-muted-foreground dark:text-slate-400">
        Controle alertas e automações relacionadas ao registro de ponto.
      </p>
    </div>
    <div className="space-y-4">
      <PreferenceToggle
        title="Resumo semanal por e-mail"
        description="Receba um consolidado com as horas trabalhadas toda segunda-feira."
        checked={preferences.weeklySummary}
        onChange={onPreferenceChange("weeklySummary")}
      />
      <PreferenceToggle
        title="Lembrete de registro no desktop"
        description="Exibe um alerta caso nenhum ponto seja registrado até 10h."
        checked={preferences.desktopReminders}
        onChange={onPreferenceChange("desktopReminders")}
      />
      <PreferenceToggle
        title="Notificações de aprovação"
        description="Avise-me quando um gestor aprovar ou recusar uma solicitação."
        checked={preferences.notifyApprovals}
        onChange={onPreferenceChange("notifyApprovals")}
      />
    </div>
  </section>
);

const PreferenceToggle = ({
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
  <div className="flex items-center justify-between rounded-2xl border bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="max-w-md">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      <p className="text-xs text-muted-foreground dark:text-slate-400">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default Settings;
