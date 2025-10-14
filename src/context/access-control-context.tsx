import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Role = "admin" | "leader" | "user";

export type FeatureKey =
  | "dashboard"
  | "timesheet"
  | "vacations"
  | "kanban"
  | "clients"
  | "employees"
  | "reports"
  | "timeTracking"
  | "users"
  | "team"
  | "approvalRequests"
  | "settings"
  | "profile";

export interface FeatureDefinition {
  key: FeatureKey;
  label: string;
  description: string;
  group: "Menu principal" | "Menu secundário" | "Outros acessos";
  path?: string;
}

const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Resumo geral de indicadores da equipe.",
    group: "Menu principal",
    path: "/",
  },
  {
    key: "timesheet",
    label: "Ponto",
    description: "Registro e acompanhamento das marcações de ponto.",
    group: "Menu principal",
    path: "/ponto",
  },
  {
    key: "vacations",
    label: "Férias",
    description: "Controle de férias, ausências e retornos planejados.",
    group: "Menu principal",
    path: "/ferias",
  },
  {
    key: "kanban",
    label: "Kanban",
    description: "Quadro de tarefas e acompanhamento de entregas.",
    group: "Menu principal",
    path: "/kanban",
  },
  {
    key: "clients",
    label: "Clientes",
    description: "Gestão de clientes, contratos e projetos ativos.",
    group: "Menu principal",
    path: "/clientes",
  },
  {
    key: "employees",
    label: "Colaboradores",
    description: "Cadastro e manutenção de colaboradores do time.",
    group: "Menu principal",
    path: "/cadastro-colaborador",
  },
  {
    key: "reports",
    label: "Relatórios",
    description: "Análises e relatórios consolidados por período.",
    group: "Menu principal",
    path: "/relatorios",
  },
  {
    key: "timeTracking",
    label: "Time Tracking",
    description: "Detalhamento das marcações de tempo por tarefa.",
    group: "Outros acessos",
    path: "/timetracking",
  },
  {
    key: "users",
    label: "Usuários",
    description: "Gestão de contas internas e perfis liberados.",
    group: "Outros acessos",
    path: "/users",
  },
  {
    key: "team",
    label: "Equipes",
    description: "Organização das equipes e atribuições de liderança.",
    group: "Outros acessos",
    path: "/team",
  },
  {
    key: "approvalRequests",
    label: "Solicitações",
    description: "Fila de solicitações de ajuste ou aprovação de horas.",
    group: "Outros acessos",
    path: "/approval-requests",
  },
  {
    key: "settings",
    label: "Configurações",
    description: "Preferências globais e permissões do workspace.",
    group: "Menu secundário",
    path: "/configuracoes",
  },
  {
    key: "profile",
    label: "Perfil",
    description: "Dados pessoais e preferências de notificações.",
    group: "Menu secundário",
    path: "/perfil",
  },
];

const ROLES: Role[] = ["admin", "leader", "user"];

export const ACCESS_ROLES = ROLES;
export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  leader: "Líder",
  user: "Usuário",
};

const STORAGE_KEY = "timesheet-access-control";
const ACTIVE_ROLE_KEY = "timesheet-active-role";

type AccessRecord = Record<FeatureKey, boolean>;
export type AccessMap = Record<Role, AccessRecord>;

const featureKeys = FEATURE_DEFINITIONS.map((feature) => feature.key);

const createAccessRecord = (enabledFeatures: FeatureKey[]): AccessRecord =>
  featureKeys.reduce<AccessRecord>((record, key) => {
    record[key] = enabledFeatures.includes(key);
    return record;
  }, {} as AccessRecord);

const cloneAccessMap = (source: AccessMap): AccessMap => ({
  admin: { ...source.admin },
  leader: { ...source.leader },
  user: { ...source.user },
});

const defaultAccess: AccessMap = {
  admin: createAccessRecord(featureKeys),
  leader: createAccessRecord([
    "dashboard",
    "timesheet",
    "vacations",
    "kanban",
    "clients",
    "employees",
    "reports",
    "timeTracking",
    "team",
    "approvalRequests",
    "profile",
  ]),
  user: createAccessRecord([
    "dashboard",
    "timesheet",
    "vacations",
    "kanban",
    "timeTracking",
    "profile",
  ]),
};

const normalizeAccessMap = (map?: Partial<AccessMap>): AccessMap => {
  const base: AccessMap = cloneAccessMap(defaultAccess);

  if (!map) {
    return base;
  }

  return ROLES.reduce<AccessMap>((normalized, role) => {
    const current = map[role] ?? {};
    normalized[role] = featureKeys.reduce<AccessRecord>((record, key) => {
      const value = current?.[key];
      record[key] = typeof value === "boolean" ? value : base[role][key];
      return record;
    }, {} as AccessRecord);
    return normalized;
  }, base);
};

type AccessControlContextValue = {
  roles: Role[];
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  accessMap: AccessMap;
  setFeatureAccess: (role: Role, feature: FeatureKey, enabled: boolean) => void;
  isFeatureEnabled: (role: Role, feature: FeatureKey) => boolean;
  canAccess: (feature: FeatureKey, role?: Role) => boolean;
  resetToDefault: () => void;
  features: FeatureDefinition[];
};

const AccessControlContext = createContext<AccessControlContextValue | undefined>(undefined);

export const AccessControlProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessMap, setAccessMap] = useState<AccessMap>(() => {
    if (typeof window === "undefined") {
      return defaultAccess;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return defaultAccess;
      }
      const parsed = JSON.parse(stored) as Partial<AccessMap>;
      return normalizeAccessMap(parsed);
    } catch (error) {
      console.warn("Failed to parse access control configuration", error);
      return defaultAccess;
    }
  });

  const [activeRole, setActiveRoleState] = useState<Role>(() => {
    if (typeof window === "undefined") {
      return "admin";
    }
    const stored = window.localStorage.getItem(ACTIVE_ROLE_KEY) as Role | null;
    return stored && ROLES.includes(stored) ? stored : "admin";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accessMap));
    }
  }, [accessMap]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_ROLE_KEY, activeRole);
    }
  }, [activeRole]);

  const setFeatureAccess = useCallback(
    (role: Role, feature: FeatureKey, enabled: boolean) => {
      setAccessMap((previous) => ({
        ...previous,
        [role]: {
          ...previous[role],
          [feature]: enabled,
        },
      }));
    },
    []
  );

  const isFeatureEnabled = useCallback(
    (role: Role, feature: FeatureKey) => Boolean(accessMap[role]?.[feature]),
    [accessMap]
  );

  const canAccess = useCallback(
    (feature: FeatureKey, role?: Role) => {
      const roleToCheck = role ?? activeRole;
      return Boolean(accessMap[roleToCheck]?.[feature]);
    },
    [accessMap, activeRole]
  );

  const setActiveRole = useCallback((role: Role) => {
    setActiveRoleState(role);
  }, []);

  const resetToDefault = useCallback(() => {
    setAccessMap(cloneAccessMap(defaultAccess));
  }, []);

  const value = useMemo<AccessControlContextValue>(
    () => ({
      roles: ROLES,
      activeRole,
      setActiveRole,
      accessMap,
      setFeatureAccess,
      isFeatureEnabled,
      canAccess,
      resetToDefault,
      features: FEATURE_DEFINITIONS,
    }),
    [activeRole, accessMap, canAccess, isFeatureEnabled, resetToDefault, setFeatureAccess]
  );

  return (
    <AccessControlContext.Provider value={value}>
      {children}
    </AccessControlContext.Provider>
  );
};

export const useAccessControl = () => {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error("useAccessControl must be used within an AccessControlProvider");
  }
  return context;
};

export const accessControlFeatures = FEATURE_DEFINITIONS;
