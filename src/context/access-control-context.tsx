import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Role = string;

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
  group: "Menu principal" | "Menu secundario" | "Outros acessos";
  path?: string;
}

export interface RoleDefinition {
  id: Role;
  name: string;
  description?: string;
  system?: boolean;
  color?: string;
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
    description: "Registro e acompanhamento das marcacoes de ponto.",
    group: "Menu principal",
    path: "/ponto",
  },
  {
    key: "vacations",
    label: "Ferias",
    description: "Controle de ferias, ausencias e retornos planejados.",
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
    description: "Gestao de clientes, contratos e projetos ativos.",
    group: "Menu principal",
    path: "/clientes",
  },
  {
    key: "employees",
    label: "Colaboradores",
    description: "Cadastro e manutencao de colaboradores do time.",
    group: "Menu principal",
    path: "/cadastro-colaborador",
  },
  {
    key: "reports",
    label: "Relatorios",
    description: "Analises e relatorios consolidados por periodo.",
    group: "Menu principal",
    path: "/relatorios",
  },
  {
    key: "timeTracking",
    label: "Time Tracking",
    description: "Detalhamento das marcacoes de tempo por tarefa.",
    group: "Outros acessos",
    path: "/timetracking",
  },
  {
    key: "users",
    label: "Usuarios",
    description: "Gestao de contas internas e perfis liberados.",
    group: "Outros acessos",
    path: "/users",
  },
  {
    key: "team",
    label: "Equipes",
    description: "Organizacao das equipes e atribuicoes de lideranca.",
    group: "Outros acessos",
    path: "/team",
  },
  {
    key: "approvalRequests",
    label: "Solicitacoes",
    description: "Fila de solicitacoes de ajuste ou aprovacao de horas.",
    group: "Outros acessos",
    path: "/approval-requests",
  },
  {
    key: "settings",
    label: "Configuracoes",
    description: "Preferencias globais e permissoes do workspace.",
    group: "Menu secundario",
    path: "/configuracoes",
  },
  {
    key: "profile",
    label: "Perfil",
    description: "Dados pessoais e preferencias de notificacoes.",
    group: "Menu secundario",
    path: "/perfil",
  },
];

const DEFAULT_ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: "admin",
    name: "Administrador",
    system: true,
    description: "Acesso completo a todas as funcionalidades do workspace.",
  },
  {
    id: "leader",
    name: "Lider",
    system: true,
    description: "Gestao de equipes, aprovacoes e acompanhamento operacional.",
  },
  {
    id: "user",
    name: "Usuario",
    system: true,
    description: "Perfil padrao para colaboradores executores.",
  },
];

const DEFAULT_ROLE_FEATURES: Record<Role, FeatureKey[]> = {
  admin: FEATURE_DEFINITIONS.map((feature) => feature.key),
  leader: [
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
  ],
  user: ["dashboard", "timesheet", "vacations", "kanban", "timeTracking", "profile"],
};

const STORAGE_KEY = "timesheet-access-control";
const ACTIVE_ROLE_KEY = "timesheet-active-role";
const ROLES_STORAGE_KEY = "timesheet-role-definitions";

type AccessRecord = Record<FeatureKey, boolean>;
type AccessMap = Record<Role, AccessRecord>;

const featureKeys = FEATURE_DEFINITIONS.map((feature) => feature.key);

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();

const createAccessRecord = (enabledFeatures: FeatureKey[]): AccessRecord =>
  featureKeys.reduce<AccessRecord>((record, key) => {
    record[key] = enabledFeatures.includes(key);
    return record;
  }, {} as AccessRecord);

const cloneAccessMap = (source: AccessMap): AccessMap =>
  Object.entries(source).reduce<AccessMap>((accumulator, [role, record]) => {
    accumulator[role] = { ...record };
    return accumulator;
  }, {} as AccessMap);

const buildDefaultAccess = (roles: RoleDefinition[]): AccessMap =>
  roles.reduce<AccessMap>((accumulator, role) => {
    const enabled = DEFAULT_ROLE_FEATURES[role.id] ?? [];
    accumulator[role.id] = createAccessRecord(enabled);
    return accumulator;
  }, {} as AccessMap);

const ensureAccessForRoles = (
  map: Partial<AccessMap> | undefined,
  roles: RoleDefinition[]
): AccessMap => {
  const base = buildDefaultAccess(roles);
  if (!map) {
    return base;
  }

  return roles.reduce<AccessMap>((accumulator, role) => {
    const current = map[role.id] ?? {};
    accumulator[role.id] = featureKeys.reduce<AccessRecord>((record, key) => {
      const value = current[key];
      record[key] = typeof value === "boolean" ? value : base[role.id][key];
      return record;
    }, {} as AccessRecord);
    return accumulator;
  }, base);
};

type CreateRolePayload = {
  name: string;
  description?: string;
  featureKeys: FeatureKey[];
};

type UpdateRolePayload = {
  name?: string;
  description?: string;
};

type AccessControlContextValue = {
  roleDefinitions: RoleDefinition[];
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  accessMap: AccessMap;
  setFeatureAccess: (role: Role, feature: FeatureKey, enabled: boolean) => void;
  isFeatureEnabled: (role: Role, feature: FeatureKey) => boolean;
  canAccess: (feature: FeatureKey, role?: Role) => boolean;
  resetToDefault: () => void;
  createRole: (payload: CreateRolePayload) => RoleDefinition;
  updateRole: (id: Role, payload: UpdateRolePayload) => void;
  deleteRole: (id: Role) => void;
  getRoleLabel: (role: Role) => string;
  features: FeatureDefinition[];
};

const AccessControlContext = createContext<AccessControlContextValue | undefined>(undefined);

export const AccessControlProvider = ({ children }: { children: React.ReactNode }) => {
  const [roleDefinitions, setRoleDefinitions] = useState<RoleDefinition[]>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_ROLE_DEFINITIONS;
    }
    try {
      const stored = window.localStorage.getItem(ROLES_STORAGE_KEY);
      if (!stored) {
        return DEFAULT_ROLE_DEFINITIONS;
      }
      const parsed = JSON.parse(stored) as RoleDefinition[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return DEFAULT_ROLE_DEFINITIONS;
      }
      return parsed;
    } catch (error) {
      console.warn("Failed to parse stored role definitions", error);
      return DEFAULT_ROLE_DEFINITIONS;
    }
  });

  const [accessMap, setAccessMap] = useState<AccessMap>(() => {
    if (typeof window === "undefined") {
      return buildDefaultAccess(DEFAULT_ROLE_DEFINITIONS);
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? (JSON.parse(stored) as Partial<AccessMap>) : undefined;
      return ensureAccessForRoles(parsed, roleDefinitions);
    } catch (error) {
      console.warn("Failed to parse access control configuration", error);
      return buildDefaultAccess(roleDefinitions);
    }
  });

  const [activeRole, setActiveRoleState] = useState<Role>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_ROLE_DEFINITIONS[0]?.id ?? "admin";
    }
    const stored = window.localStorage.getItem(ACTIVE_ROLE_KEY);
    if (stored && roleDefinitions.find((role) => role.id === stored)) {
      return stored;
    }
    return DEFAULT_ROLE_DEFINITIONS[0]?.id ?? "admin";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roleDefinitions));
    }
  }, [roleDefinitions]);

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

  useEffect(() => {
    setAccessMap((previous) => ensureAccessForRoles(previous, roleDefinitions));
  }, [roleDefinitions]);

  useEffect(() => {
    if (!roleDefinitions.find((role) => role.id === activeRole)) {
      setActiveRoleState(roleDefinitions[0]?.id ?? "admin");
    }
  }, [activeRole, roleDefinitions]);

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
    setRoleDefinitions(DEFAULT_ROLE_DEFINITIONS);
    setAccessMap(buildDefaultAccess(DEFAULT_ROLE_DEFINITIONS));
  }, []);

  const createRole = useCallback(
    ({ name, description, featureKeys: enabledFeatures }: CreateRolePayload) => {
      const baseId = slugify(name);
      const existingIds = new Set(roleDefinitions.map((role) => role.id));
      let candidate = baseId || `role_${Date.now()}`;
      let suffix = 1;
      while (existingIds.has(candidate)) {
        candidate = `${baseId || "role"}_${suffix}`;
        suffix += 1;
      }

      const newRole: RoleDefinition = {
        id: candidate,
        name: name.trim() || `Perfil ${suffix}`,
        description,
        system: false,
      };

      setRoleDefinitions((previous) => [...previous, newRole]);
      setAccessMap((previous) => ({
        ...previous,
        [newRole.id]: createAccessRecord(enabledFeatures),
      }));

      return newRole;
    },
    [roleDefinitions]
  );

  const updateRole = useCallback((id: Role, payload: UpdateRolePayload) => {
    setRoleDefinitions((previous) =>
      previous.map((role) =>
        role.id === id
          ? {
              ...role,
              name: payload.name?.trim() || role.name,
              description: payload.description ?? role.description,
            }
          : role
      )
    );
  }, []);

  const deleteRole = useCallback(
    (id: Role) => {
      const role = roleDefinitions.find((item) => item.id === id);
      if (!role || role.system) {
        return;
      }

      setRoleDefinitions((previous) => previous.filter((item) => item.id !== id));
      setAccessMap((previous) => {
        const { [id]: _, ...rest } = previous;
        return rest;
      });
    },
    [roleDefinitions]
  );

  const getRoleLabel = useCallback(
    (role: Role) =>
      roleDefinitions.find((definition) => definition.id === role)?.name ??
      role ??
      "Perfil",
    [roleDefinitions]
  );

  const value = useMemo<AccessControlContextValue>(
    () => ({
      roleDefinitions,
      activeRole,
      setActiveRole,
      accessMap,
      setFeatureAccess,
      isFeatureEnabled,
      canAccess,
      resetToDefault,
      createRole,
      updateRole,
      deleteRole,
      getRoleLabel,
      features: FEATURE_DEFINITIONS,
    }),
    [
      roleDefinitions,
      activeRole,
      accessMap,
      canAccess,
      createRole,
      deleteRole,
      getRoleLabel,
      isFeatureEnabled,
      resetToDefault,
      setFeatureAccess,
    ]
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
