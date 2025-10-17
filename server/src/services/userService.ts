import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import type { FilterQuery } from "mongoose";
import {
  UserModel,
  UserRole,
  UserStatus,
  type UserDoc,
  type Address,
  type PersonalInfo,
  type BankInfo,
  type WorkSchedule,
  type WorkScheduleDay,
  type EmergencyContact,
  type UserDocumentInfo,
  type BenefitInfo,
  type DependentInfo,
  type EmploymentHistoryEntry,
  type SkillInfo,
} from "../models/User";
import { ClientModel, ProjectModel } from "../models/Client";
import { RoleModel } from "../models/Role";
import { HttpException } from "../utils/httpException";

const validateTenant = (tenantId: string): Types.ObjectId => {
  if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
    throw new HttpException(400, "Invalid tenant context");
  }
  return new Types.ObjectId(tenantId);
};

type RelationalModel = typeof ClientModel | typeof ProjectModel;

export type UserFilters = {
  status?: UserStatus;
  role?: UserRole;
  search?: string;
  clientId?: string;
  projectId?: string;
};

type EmergencyContactInput = {
  name?: string | null;
  phone?: string | null;
  relationship?: string | null;
} | null;

type PersonalInfoInput = {
  nationality?: string | null;
  maritalStatus?: string | null;
  educationLevel?: string | null;
  emergencyContact?: EmergencyContactInput;
} | null;

type AddressInput = {
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
} | null;

type BankInfoInput = {
  bankName?: string | null;
  accountType?: string | null;
  accountNumber?: string | null;
  agency?: string | null;
} | null;

type WorkScheduleDayInput = {
  dayOfWeek?: number | null;
  enabled?: boolean | null;
  hours?: number | null;
} | null;

type WorkScheduleInput = {
  days?: WorkScheduleDayInput[] | null;
} | null;


type DocumentInput = {
  type?: string | null;
  number?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuer?: string | null;
  fileUrl?: string | null;
  notes?: string | null;
} | null;

type BenefitInput = {
  name?: string | null;
  provider?: string | null;
  status?: string | null;
  joinDate?: string | null;
  endDate?: string | null;
  contribution?: string | number | null;
  notes?: string | null;
} | null;

type DependentInput = {
  name?: string | null;
  relationship?: string | null;
  birthDate?: string | null;
  document?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
} | null;

type EmploymentHistoryInput = {
  company?: string | null;
  role?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  responsibilities?: string | null;
  achievements?: string | null;
  technologies?: string[] | string | null;
  location?: string | null;
} | null;

type SkillInput = {
  name?: string | null;
  level?: string | null;
  category?: string | null;
  certified?: string | boolean | number | null;
  certificationAuthority?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
} | null;

type BaseUserInput = {
  email?: string;
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  password?: string;
  photo?: string | null;
  hireDate?: string | null;
  terminationDate?: string | null;
  cpf?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  contractType?: string | null;
  workSchedule?: WorkScheduleInput;
  address?: AddressInput;
  managerId?: string | null;
  additionalNotes?: string | null;
  workStartTime?: string | null;
  workEndTime?: string | null;
  selectedClients?: (string | null | undefined)[] | null;
  selectedProjects?: (string | null | undefined)[] | null;
  personalInfo?: PersonalInfoInput;
  bankInfo?: BankInfoInput;
  documents?: DocumentInput[] | null;
  benefits?: BenefitInput[] | null;
  dependents?: DependentInput[] | null;
  employmentHistory?: EmploymentHistoryInput[] | null;
  skills?: SkillInput[] | null;
};

export interface CreateUserInput extends BaseUserInput {
  email: string;
  name: string;
  password: string;
}

export type UpdateUserInput = BaseUserInput;

type ManagerSummary = {
  id: string;
  name?: string;
  email?: string;
  role?: UserRole;
};

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  photo?: string;
  hireDate?: string;
  terminationDate?: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  position?: string;
  department?: string;
  contractType?: string;
  workSchedule?: WorkSchedule;
  workStartTime?: string;
  workEndTime?: string;
  address?: Address;
  additionalNotes?: string;
  selectedClients: string[];
  selectedProjects: string[];
  personalInfo?: PersonalInfo;
  bankInfo?: BankInfo;
  documents: Array<{
    type?: string;
    number?: string;
    issueDate?: string;
    expiryDate?: string;
    issuer?: string;
    fileUrl?: string;
    notes?: string;
  }>;
  benefits: Array<{
    name?: string;
    provider?: string;
    status?: string;
    joinDate?: string;
    endDate?: string;
    contribution?: number;
    notes?: string;
  }>;
  dependents: Array<{
    name?: string;
    relationship?: string;
    birthDate?: string;
    document?: string;
    phone?: string;
    email?: string;
    notes?: string;
  }>;
  employmentHistory: Array<{
    company?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    responsibilities?: string;
    achievements?: string;
    technologies?: string[];
    location?: string;
  }>;
  skills: Array<{
    name?: string;
    level?: string;
    category?: string;
    certified?: boolean;
    certificationAuthority?: string;
    issuedAt?: string;
    expiresAt?: string;
    notes?: string;
  }>;
  managerId?: string;
  manager?: ManagerSummary | null;
  createdAt: string;
  updatedAt: string;
};

type UserDocumentWithRelations = UserDoc & {
  manager?:
    | Types.ObjectId
    | null
    | {
        _id: Types.ObjectId;
        name?: string;
        email?: string;
        role?: UserRole;
      };
};

const sanitizeString = (value?: string | null) => {
  if (value === undefined || value === null) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const sanitizeEmail = (value: string) => value.trim().toLowerCase();

const normalizeCpf = (value?: string | null) => {
  if (value === undefined || value === null) return undefined;
  const digits = value.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.length !== 11) {
    throw new HttpException(400, "CPF must have 11 digits");
  }
  return digits;
};

const parseDateInput = (
  value: string | null | undefined,
  field: string,
  options: { allowNull?: boolean } = {}
): Date | undefined | null => {
  if (value === undefined) return undefined;
  if (value === null || value === "") {
    return options.allowNull ? null : undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return options.allowNull ? null : undefined;
  }

  const brazilianFormat = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = brazilianFormat.exec(trimmed);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (
      Number.isInteger(day) &&
      Number.isInteger(month) &&
      Number.isInteger(year) &&
      day >= 1 &&
      day <= 31 &&
      month >= 1 &&
      month <= 12
    ) {
      const parsedBrazilian = new Date(Date.UTC(year, month - 1, day));
      if (!Number.isNaN(parsedBrazilian.getTime())) {
        return parsedBrazilian;
      }
    }
    throw new HttpException(400, `Invalid ${field}`);
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new HttpException(400, `Invalid ${field}`);
  }
  return parsed;
};

const formatDateToBR = (value?: Date | null): string | undefined => {
  if (!value) return undefined;
  const source = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(source.getTime())) {
    return undefined;
  }
  const day = String(source.getUTCDate()).padStart(2, "0");
  const month = String(source.getUTCMonth() + 1).padStart(2, "0");
  const year = source.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const DEFAULT_WORK_SCHEDULE_DAYS: ReadonlyArray<WorkScheduleDay> = [
  { dayOfWeek: 0, enabled: false, hours: 0 },
  { dayOfWeek: 1, enabled: true, hours: 8 },
  { dayOfWeek: 2, enabled: true, hours: 8 },
  { dayOfWeek: 3, enabled: true, hours: 8 },
  { dayOfWeek: 4, enabled: true, hours: 8 },
  { dayOfWeek: 5, enabled: true, hours: 8 },
  { dayOfWeek: 6, enabled: false, hours: 0 },
];

const cloneDefaultWorkScheduleDays = (): WorkScheduleDay[] =>
  DEFAULT_WORK_SCHEDULE_DAYS.map((day) => ({ ...day }));

const sanitizeWorkScheduleDay = (input: WorkScheduleDayInput | WorkScheduleDay | null | undefined): WorkScheduleDay | null => {
  if (!input) return null;

  const rawDay =
    typeof input.dayOfWeek === "number"
      ? input.dayOfWeek
      : Number(
          typeof (input as { dayOfWeek?: unknown }).dayOfWeek === "string"
            ? (input as { dayOfWeek?: string }).dayOfWeek
            : (input as { dayOfWeek?: number }).dayOfWeek
        );

  if (!Number.isInteger(rawDay) || rawDay < 0 || rawDay > 6) {
    return null;
  }

  const enabled =
    typeof input.enabled === "boolean"
      ? input.enabled
      : Boolean((input as { enabled?: boolean | null }).enabled ?? true);

  const rawHours =
    typeof input.hours === "number"
      ? input.hours
      : Number((input as { hours?: string | number | null }).hours ?? (enabled ? 8 : 0));

  const sanitizedHours = enabled ? Math.max(0, Math.min(24, Math.round(rawHours * 100) / 100)) : 0;

  return {
    dayOfWeek: rawDay,
    enabled,
    hours: sanitizedHours,
  };
};

const resolveWorkScheduleDays = (
  days?: Array<WorkScheduleDayInput | WorkScheduleDay> | null
): WorkScheduleDay[] => {
  const resolved = new Map<number, WorkScheduleDay>();
  cloneDefaultWorkScheduleDays().forEach((day) => resolved.set(day.dayOfWeek, day));

  if (Array.isArray(days)) {
    days.forEach((item) => {
      const normalized = sanitizeWorkScheduleDay(item);
      if (normalized) {
        resolved.set(normalized.dayOfWeek, normalized);
      }
    });
  }

  return Array.from(resolved.values()).sort((a, b) => a.dayOfWeek - b.dayOfWeek);
};

const normalizeWorkSchedule = (input?: WorkScheduleInput): WorkSchedule | undefined => {
  if (input === undefined || input === null) return undefined;
  const days = resolveWorkScheduleDays(input.days ?? undefined);
  return { days };
};

const deriveLegacyWorkSchedule = (value: unknown): WorkSchedule => {
  if (!value || typeof value !== "object") {
    return { days: cloneDefaultWorkScheduleDays() };
  }

  const maybeSchedule = value as { days?: Array<WorkScheduleDayInput | WorkScheduleDay> };
  if (Array.isArray(maybeSchedule.days)) {
    return { days: resolveWorkScheduleDays(maybeSchedule.days) };
  }

  const startTime =
    typeof (value as { startTime?: unknown }).startTime === "string"
      ? ((value as { startTime?: string }).startTime as string)
      : undefined;
  const endTime =
    typeof (value as { endTime?: unknown }).endTime === "string"
      ? ((value as { endTime?: string }).endTime as string)
      : undefined;

  const computeHoursFromRange = (start?: string, end?: string): number | null => {
    if (!start || !end) return null;
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    if (
      [startHour, startMinute, endHour, endMinute].some(
        (value) => Number.isNaN(value) || value < 0
      )
    ) {
      return null;
    }
    const diffMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
    if (diffMinutes <= 0) return null;
    return Math.round((diffMinutes / 60) * 100) / 100;
  };

  const legacyHours = computeHoursFromRange(startTime, endTime) ?? 8;
  const days = cloneDefaultWorkScheduleDays().map((day) => ({
    ...day,
    hours: day.enabled ? legacyHours : 0,
  }));
  return { days };
};

const ensureWorkSchedule = (value?: WorkSchedule | null | undefined): WorkSchedule => {
  if (!value) {
    return { days: cloneDefaultWorkScheduleDays() };
  }
  if (Array.isArray((value as WorkSchedule).days)) {
    return { days: resolveWorkScheduleDays((value as WorkSchedule).days) };
  }
  return deriveLegacyWorkSchedule(value);
};

const normalizeAddress = (input?: AddressInput): Address | undefined => {
  if (!input) return undefined;
  const address: Address = {
    street: sanitizeString(input.street),
    number: sanitizeString(input.number),
    complement: sanitizeString(input.complement),
    neighborhood: sanitizeString(input.neighborhood),
    city: sanitizeString(input.city),
    state: sanitizeString(input.state),
    zipCode: sanitizeString(input.zipCode),
  };
  return Object.values(address).some(Boolean) ? address : undefined;
};

const normalizeEmergencyContact = (
  input?: EmergencyContactInput
): EmergencyContact | undefined => {
  if (!input) return undefined;
  const emergencyContact: EmergencyContact = {
    name: sanitizeString(input.name),
    phone: sanitizeString(input.phone),
    relationship: sanitizeString(input.relationship),
  };
  return Object.values(emergencyContact).some(Boolean) ? emergencyContact : undefined;
};

const normalizePersonalInfo = (
  input?: PersonalInfoInput
): PersonalInfo | undefined => {
  if (!input) return undefined;
  const emergencyContact = normalizeEmergencyContact(input.emergencyContact);
  const personalInfo: PersonalInfo = {
    nationality: sanitizeString(input.nationality),
    maritalStatus: sanitizeString(input.maritalStatus),
    educationLevel: sanitizeString(input.educationLevel),
    ...(emergencyContact ? { emergencyContact } : {}),
  };

  const hasValues = Object.entries(personalInfo).some(([key, value]) => {
    if (key === "emergencyContact") {
      return value && Object.values(value).some(Boolean);
    }
    return Boolean(value);
  });

  return hasValues ? personalInfo : undefined;
};

const normalizeBankInfo = (input?: BankInfoInput): BankInfo | undefined => {
  if (!input) return undefined;
  const bankInfo: BankInfo = {
    bankName: sanitizeString(input.bankName),
    accountType: sanitizeString(input.accountType),
    accountNumber: sanitizeString(input.accountNumber),
    agency: sanitizeString(input.agency),
  };
  return Object.values(bankInfo).some(Boolean) ? bankInfo : undefined;
};


const parseNumberInput = (value: string | number | null | undefined): number | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") {
    return Number.isNaN(value) ? undefined : value;
  }
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed.replace(/,/g, "."));
  return Number.isNaN(parsed) ? undefined : parsed;
};

const normalizeBooleanInput = (value: string | boolean | number | null | undefined): boolean | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "sim"].includes(normalized)) return true;
  if (["false", "0", "no", "nao"].includes(normalized)) return false;
  return undefined;
};

const normalizeStringArray = (value: string[] | string | null | undefined): string[] | undefined => {
  if (value === undefined || value === null) return undefined;
  const values = Array.isArray(value)
    ? value
    : value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  const sanitized = values
    .map((item) => sanitizeString(item))
    .filter((item): item is string => Boolean(item));
  return sanitized.length ? sanitized : [];
};

const normalizeDocuments = (input?: DocumentInput[] | null): UserDocumentInfo[] | undefined => {
  if (input === undefined) return undefined;
  const items = (input ?? []).map((item) => {
    if (!item) return undefined;
    const normalized: UserDocumentInfo = {
      type: sanitizeString(item.type),
      number: sanitizeString(item.number),
      issueDate: parseDateInput(item.issueDate ?? undefined, "issueDate", { allowNull: true }) ?? undefined,
      expiryDate: parseDateInput(item.expiryDate ?? undefined, "expiryDate", { allowNull: true }) ?? undefined,
      issuer: sanitizeString(item.issuer),
      fileUrl: sanitizeString(item.fileUrl),
      notes: sanitizeString(item.notes),
    };
    return Object.values(normalized).some(Boolean) ? normalized : undefined;
  }).filter((value): value is UserDocumentInfo => Boolean(value));
  return items;
};

const normalizeBenefits = (input?: BenefitInput[] | null): BenefitInfo[] | undefined => {
  if (input === undefined) return undefined;
  const items = (input ?? []).map((item) => {
    if (!item) return undefined;
    const normalized: BenefitInfo = {
      name: sanitizeString(item.name),
      provider: sanitizeString(item.provider),
      status: sanitizeString(item.status),
      joinDate: parseDateInput(item.joinDate ?? undefined, "joinDate", { allowNull: true }) ?? undefined,
      endDate: parseDateInput(item.endDate ?? undefined, "endDate", { allowNull: true }) ?? undefined,
      contribution: parseNumberInput(item.contribution),
      notes: sanitizeString(item.notes),
    };
    const hasData = Object.values(normalized).some((value) => value !== undefined && value !== null);
    return hasData ? normalized : undefined;
  }).filter((value): value is BenefitInfo => Boolean(value));
  return items;
};

const normalizeDependents = (input?: DependentInput[] | null): DependentInfo[] | undefined => {
  if (input === undefined) return undefined;
  const items = (input ?? []).map((item) => {
    if (!item) return undefined;
    const normalized: DependentInfo = {
      name: sanitizeString(item.name),
      relationship: sanitizeString(item.relationship),
      birthDate: parseDateInput(item.birthDate ?? undefined, "birthDate", { allowNull: true }) ?? undefined,
      document: sanitizeString(item.document),
      phone: sanitizeString(item.phone),
      email: sanitizeString(item.email),
      notes: sanitizeString(item.notes),
    };
    return Object.values(normalized).some(Boolean) ? normalized : undefined;
  }).filter((value): value is DependentInfo => Boolean(value));
  return items;
};

const normalizeEmploymentHistory = (
  input?: EmploymentHistoryInput[] | null
): EmploymentHistoryEntry[] | undefined => {
  if (input === undefined) return undefined;
  const items = (input ?? []).map((item) => {
    if (!item) return undefined;
    const normalized: EmploymentHistoryEntry = {
      company: sanitizeString(item.company),
      role: sanitizeString(item.role),
      startDate: parseDateInput(item.startDate ?? undefined, "startDate", { allowNull: true }) ?? undefined,
      endDate: parseDateInput(item.endDate ?? undefined, "endDate", { allowNull: true }) ?? undefined,
      responsibilities: sanitizeString(item.responsibilities),
      achievements: sanitizeString(item.achievements),
      technologies: normalizeStringArray(item.technologies),
      location: sanitizeString(item.location),
    };
    const hasTech = normalized.technologies && normalized.technologies.length > 0;
    const hasData = hasTech || Object.entries(normalized).some(([key, value]) => {
      if (key === "technologies") return false;
      return Boolean(value);
    });
    return hasData ? normalized : undefined;
  }).filter((value): value is EmploymentHistoryEntry => Boolean(value));
  return items;
};

const normalizeSkills = (input?: SkillInput[] | null): SkillInfo[] | undefined => {
  if (input === undefined) return undefined;
  const items = (input ?? []).map((item) => {
    if (!item) return undefined;
    const normalized: SkillInfo = {
      name: sanitizeString(item.name),
      level: sanitizeString(item.level),
      category: sanitizeString(item.category),
      certified: normalizeBooleanInput(item.certified),
      certificationAuthority: sanitizeString(item.certificationAuthority),
      issuedAt: parseDateInput(item.issuedAt ?? undefined, "issuedAt", { allowNull: true }) ?? undefined,
      expiresAt: parseDateInput(item.expiresAt ?? undefined, "expiresAt", { allowNull: true }) ?? undefined,
      notes: sanitizeString(item.notes),
    };
    const hasData = Object.values(normalized).some((value) => value !== undefined && value !== null);
    return hasData ? normalized : undefined;
  }).filter((value): value is SkillInfo => Boolean(value));
  return items;
};

const normalizeIdArray = async (
  tenantId: Types.ObjectId,
  input: (string | null | undefined)[] | null | undefined,
  model: RelationalModel,
  entityLabel: string
): Promise<Types.ObjectId[] | undefined> => {
  if (input === undefined) return undefined;
  const values = (input ?? [])
    .map((value) => (typeof value === "string" ? value.trim() : value ?? undefined))
    .filter((value): value is string => Boolean(value));

  if (values.length === 0) {
    return [];
  }

  const invalid = values.filter((value) => !Types.ObjectId.isValid(value));
  if (invalid.length > 0) {
    throw new HttpException(400, `Invalid ${entityLabel} id: ${invalid[0]}`);
  }

  const count = await model
    .countDocuments({ _id: { $in: values }, tenantId })
    .exec();
  if (count !== values.length) {
    throw new HttpException(404, `Some ${entityLabel}s were not found`);
  }

  return values.map((value) => new Types.ObjectId(value));
};

const normalizeManagerId = async (
  tenantId: Types.ObjectId,
  managerId: string | null | undefined,
  options: { selfId?: string } = {}
): Promise<Types.ObjectId | null | undefined> => {
  if (managerId === undefined) return undefined;
  const trimmed = managerId?.trim();
  if (!trimmed) return null;
  if (!Types.ObjectId.isValid(trimmed)) {
    throw new HttpException(400, "Invalid managerId");
  }
  if (options.selfId && trimmed === options.selfId) {
    throw new HttpException(400, "User cannot be their own manager");
  }
  const exists = await UserModel.exists({ _id: trimmed, tenantId });
  if (!exists) {
    throw new HttpException(404, "Manager not found");
  }
  return new Types.ObjectId(trimmed);
};

const getManagerSummary = (
  value: UserDocumentWithRelations["manager"]
): ManagerSummary | null => {
  if (value && !(value instanceof Types.ObjectId)) {
    const manager = value as {
      _id: Types.ObjectId;
      name?: string;
      email?: string;
      role?: UserRole;
    };
    return {
      id: manager._id.toString(),
      name: manager.name,
      email: manager.email,
      role: manager.role,
    };
  }
  return null;
};

const formatUser = (user: UserDocumentWithRelations): UserResponse => {
  const managerDetails = getManagerSummary(user.manager);

  const managerId =
    managerDetails?.id ??
    (user.manager instanceof Types.ObjectId ? user.manager.toString() : undefined);

  const workSchedule = ensureWorkSchedule(user.workSchedule);

  const address = user.address
    ? {
        street: user.address.street ?? undefined,
        number: user.address.number ?? undefined,
        complement: user.address.complement ?? undefined,
        neighborhood: user.address.neighborhood ?? undefined,
        city: user.address.city ?? undefined,
        state: user.address.state ?? undefined,
        zipCode: user.address.zipCode ?? undefined,
      }
    : undefined;

  const personalInfo = user.personalInfo
    ? {
        nationality: user.personalInfo.nationality ?? undefined,
        maritalStatus: user.personalInfo.maritalStatus ?? undefined,
        educationLevel: user.personalInfo.educationLevel ?? undefined,
        ...(user.personalInfo.emergencyContact
          ? {
              emergencyContact: {
                name: user.personalInfo.emergencyContact.name ?? undefined,
                phone: user.personalInfo.emergencyContact.phone ?? undefined,
                relationship: user.personalInfo.emergencyContact.relationship ?? undefined,
              },
            }
          : {}),
      }
    : undefined;

  const bankInfo = user.bankInfo
    ? {
        bankName: user.bankInfo.bankName ?? undefined,
        accountType: user.bankInfo.accountType ?? undefined,
        accountNumber: user.bankInfo.accountNumber ?? undefined,
        agency: user.bankInfo.agency ?? undefined,
      }
    : undefined;

  const documents = (user.documents ?? []).map((document) => ({
    type: document.type ?? undefined,
    number: document.number ?? undefined,
    issueDate: formatDateToBR(document.issueDate ?? undefined),
    expiryDate: formatDateToBR(document.expiryDate ?? undefined),
    issuer: document.issuer ?? undefined,
    fileUrl: document.fileUrl ?? undefined,
    notes: document.notes ?? undefined,
  }));

  const benefits = (user.benefits ?? []).map((benefit) => ({
    name: benefit.name ?? undefined,
    provider: benefit.provider ?? undefined,
    status: benefit.status ?? undefined,
    joinDate: formatDateToBR(benefit.joinDate ?? undefined),
    endDate: formatDateToBR(benefit.endDate ?? undefined),
    contribution: benefit.contribution ?? undefined,
    notes: benefit.notes ?? undefined,
  }));

  const dependents = (user.dependents ?? []).map((dependent) => ({
    name: dependent.name ?? undefined,
    relationship: dependent.relationship ?? undefined,
    birthDate: formatDateToBR(dependent.birthDate ?? undefined),
    document: dependent.document ?? undefined,
    phone: dependent.phone ?? undefined,
    email: dependent.email ?? undefined,
    notes: dependent.notes ?? undefined,
  }));

  const employmentHistory = (user.employmentHistory ?? []).map((history) => ({
    company: history.company ?? undefined,
    role: history.role ?? undefined,
    startDate: formatDateToBR(history.startDate ?? undefined),
    endDate: formatDateToBR(history.endDate ?? undefined),
    responsibilities: history.responsibilities ?? undefined,
    achievements: history.achievements ?? undefined,
    technologies: history.technologies ?? undefined,
    location: history.location ?? undefined,
  }));

  const skills = (user.skills ?? []).map((skill) => ({
    name: skill.name ?? undefined,
    level: skill.level ?? undefined,
    category: skill.category ?? undefined,
    certified: skill.certified ?? undefined,
    certificationAuthority: skill.certificationAuthority ?? undefined,
    issuedAt: formatDateToBR(skill.issuedAt ?? undefined),
    expiresAt: formatDateToBR(skill.expiresAt ?? undefined),
    notes: skill.notes ?? undefined,
  }));

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    photo: user.photo ?? undefined,
    hireDate: formatDateToBR(user.hireDate),
    terminationDate: formatDateToBR(user.terminationDate),
    cpf: user.cpf ?? undefined,
    birthDate: formatDateToBR(user.birthDate),
    phone: user.phone ?? undefined,
    position: user.position ?? undefined,
    department: user.department ?? undefined,
    contractType: user.contractType ?? undefined,
    workSchedule,
    workStartTime: user.workStartTime ?? undefined,
    workEndTime: user.workEndTime ?? undefined,
    address,
    additionalNotes: user.additionalNotes ?? undefined,
    selectedClients: (user.selectedClients ?? []).map((client) => client.toString()),
    selectedProjects: (user.selectedProjects ?? []).map((project) => project.toString()),
    personalInfo,
    bankInfo,
    documents,
    benefits,
    dependents,
    employmentHistory,
    skills,
    managerId,
    manager: managerDetails,
    createdAt: formatDateToBR(user.createdAt),
    updatedAt: formatDateToBR(user.updatedAt),
  };
};

const buildSearchFilter = (search?: string) => {
  const trimmed = search?.trim();
  if (!trimmed) return undefined;
  const escaped = trimmed.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");
  return [{ name: regex }, { email: regex }];
};

export const userService = {
  async listUsers(tenantId: string, filters: UserFilters = {}): Promise<UserResponse[]> {
    const tenantObjectId = validateTenant(tenantId);
    const query: FilterQuery<UserDoc> = { tenantId: tenantObjectId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.role) {
      query.role = filters.role;
    }

    const searchConditions = buildSearchFilter(filters.search);
    if (searchConditions) {
      query.$or = searchConditions as FilterQuery<UserDoc>[];
    }

    if (filters.clientId) {
      if (!Types.ObjectId.isValid(filters.clientId)) {
        throw new HttpException(400, "Invalid clientId");
      }
      (query as Record<string, unknown>).selectedClients = {
        $in: [new Types.ObjectId(filters.clientId)],
      };
    }

    if (filters.projectId) {
      if (!Types.ObjectId.isValid(filters.projectId)) {
        throw new HttpException(400, "Invalid projectId");
      }
      (query as Record<string, unknown>).selectedProjects = {
        $in: [new Types.ObjectId(filters.projectId)],
      };
    }

    const users = await UserModel.find(query)
      .populate({
        path: "manager",
        select: "name email role",
        match: { tenantId: tenantObjectId },
      })
      .sort({ createdAt: -1 })
      .exec();

    return users.map((user) => formatUser(user));
  },

  async getUserById(tenantId: string, id: string): Promise<UserResponse> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid user ID");
    }

    const tenantObjectId = validateTenant(tenantId);

    const user = await UserModel.findOne({ _id: id, tenantId: tenantObjectId })
      .populate({
        path: "manager",
        select: "name email role",
        match: { tenantId: tenantObjectId },
      })
      .exec();
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    return formatUser(user);
  },

  async createUser(input: CreateUserInput, tenantId: string): Promise<UserResponse> {
    const tenantObjectId = validateTenant(tenantId);
    const email = sanitizeEmail(input.email);
    const name = sanitizeString(input.name);
    if (!name) {
      throw new HttpException(400, "Name is required");
    }

    const existing = await UserModel.exists({ tenantId: tenantObjectId, email });
    if (existing) {
      throw new HttpException(409, "E-mail already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const hireDate = parseDateInput(input.hireDate, "hireDate");
    const terminationDate = parseDateInput(input.terminationDate, "terminationDate");
    const birthDate = parseDateInput(input.birthDate, "birthDate");

    const selectedClients = await normalizeIdArray(
      tenantObjectId,
      input.selectedClients,
      ClientModel,
      "client"
    );
    const selectedProjects = await normalizeIdArray(
      tenantObjectId,
      input.selectedProjects,
      ProjectModel,
      "project"
    );
    const manager = await normalizeManagerId(tenantObjectId, input.managerId);

    const workSchedule = normalizeWorkSchedule(input.workSchedule) ?? ensureWorkSchedule(undefined);
    const address = normalizeAddress(input.address);
    const personalInfo = normalizePersonalInfo(input.personalInfo);
    const bankInfo = normalizeBankInfo(input.bankInfo);
    const documents = normalizeDocuments(input.documents);
    const benefits = normalizeBenefits(input.benefits);
    const dependents = normalizeDependents(input.dependents);
    const employmentHistory = normalizeEmploymentHistory(input.employmentHistory);
    const skills = normalizeSkills(input.skills);
    const additionalNotes = sanitizeString(input.additionalNotes);
    const workStartTime = sanitizeString(input.workStartTime);
    const workEndTime = sanitizeString(input.workEndTime);
    const phone = sanitizeString(input.phone);
    const position = sanitizeString(input.position);
    const department = sanitizeString(input.department);
    const contractType = sanitizeString(input.contractType);
    const photo = sanitizeString(input.photo);
    const cpf = normalizeCpf(input.cpf);

    const user = await UserModel.create({
      tenantId: tenantObjectId,
      email,
      passwordHash,
      name,
      role: input.role ?? UserRole.EMPLOYEE,
      status: input.status ?? UserStatus.ACTIVE,
      ...(photo ? { photo } : {}),
      ...(hireDate ? { hireDate } : {}),
      ...(terminationDate ? { terminationDate } : {}),
      ...(cpf ? { cpf } : {}),
      ...(birthDate ? { birthDate } : {}),
      ...(phone ? { phone } : {}),
      ...(position ? { position } : {}),
      ...(department ? { department } : {}),
      ...(contractType ? { contractType } : {}),
      workSchedule,
      ...(address ? { address } : {}),
      ...(manager ? { manager } : {}),
      ...(additionalNotes ? { additionalNotes } : {}),
      ...(workStartTime ? { workStartTime } : {}),
      ...(workEndTime ? { workEndTime } : {}),
      selectedClients: selectedClients ?? [],
      selectedProjects: selectedProjects ?? [],
      documents: documents ?? [],
      benefits: benefits ?? [],
      dependents: dependents ?? [],
      employmentHistory: employmentHistory ?? [],
      skills: skills ?? [],
      ...(personalInfo ? { personalInfo } : {}),
      ...(bankInfo ? { bankInfo } : {}),
    });

    return this.getUserById(tenantId, user.id);
  },

  async updateUser(tenantId: string, id: string, input: UpdateUserInput): Promise<UserResponse> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid user ID");
    }

    const tenantObjectId = validateTenant(tenantId);

    const user = await UserModel.findOne({ _id: id, tenantId: tenantObjectId });
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (input.email !== undefined) {
      const email = sanitizeEmail(input.email);
      if (!email) {
        throw new HttpException(400, "Invalid e-mail");
      }
      if (email !== user.email) {
        const exists = await UserModel.exists({
          tenantId: tenantObjectId,
          email,
          _id: { $ne: id },
        });
        if (exists) {
          throw new HttpException(409, "E-mail already registered");
        }
        user.email = email;
      }
    }

    if (input.name !== undefined) {
      const name = sanitizeString(input.name);
      if (!name) {
        throw new HttpException(400, "Name is required");
      }
      user.name = name;
    }

    if (input.role !== undefined) {
      user.role = input.role;
    }

    if (input.status !== undefined) {
      user.status = input.status;
    }

    if (input.password) {
      user.passwordHash = await bcrypt.hash(input.password, 10);
    }

    if (input.photo !== undefined) {
      user.photo = sanitizeString(input.photo);
    }

    const hireDate = parseDateInput(input.hireDate, "hireDate", { allowNull: true });
    if (hireDate !== undefined) {
      user.hireDate = hireDate ?? undefined;
    }

    const terminationDate = parseDateInput(
      input.terminationDate,
      "terminationDate",
      { allowNull: true }
    );
    if (terminationDate !== undefined) {
      user.terminationDate = terminationDate ?? undefined;
    }

    const birthDate = parseDateInput(input.birthDate, "birthDate", { allowNull: true });
    if (birthDate !== undefined) {
      user.birthDate = birthDate ?? undefined;
    }

    if (input.phone !== undefined) {
      user.phone = sanitizeString(input.phone);
    }

    if (input.position !== undefined) {
      user.position = sanitizeString(input.position);
    }

    if (input.department !== undefined) {
      user.department = sanitizeString(input.department);
    }

    if (input.contractType !== undefined) {
      user.contractType = sanitizeString(input.contractType);
    }

    if (input.workSchedule !== undefined) {
      user.workSchedule =
        normalizeWorkSchedule(input.workSchedule) ?? ensureWorkSchedule(undefined);
    }

    const address = normalizeAddress(input.address);
    if (input.address !== undefined) {
      user.address = address;
    }

    const manager = await normalizeManagerId(tenantObjectId, input.managerId, { selfId: id });
    if (manager !== undefined) {
      user.manager = manager ?? undefined;
    }

    if (input.additionalNotes !== undefined) {
      user.additionalNotes = sanitizeString(input.additionalNotes);
    }

    if (input.workStartTime !== undefined) {
      user.workStartTime = sanitizeString(input.workStartTime);
    }

    if (input.workEndTime !== undefined) {
      user.workEndTime = sanitizeString(input.workEndTime);
    }

    const selectedClients = await normalizeIdArray(
      tenantObjectId,
      input.selectedClients,
      ClientModel,
      "client"
    );
    if (selectedClients !== undefined) {
      user.selectedClients = selectedClients;
    }

    const selectedProjects = await normalizeIdArray(
      tenantObjectId,
      input.selectedProjects,
      ProjectModel,
      "project"
    );
    if (selectedProjects !== undefined) {
      user.selectedProjects = selectedProjects;
    }

    if (input.cpf !== undefined) {
      user.cpf = normalizeCpf(input.cpf);
    }

    const personalInfo = normalizePersonalInfo(input.personalInfo);
    if (input.personalInfo !== undefined) {
      user.personalInfo = personalInfo;
    }

    const bankInfo = normalizeBankInfo(input.bankInfo);
    if (input.bankInfo !== undefined) {
      user.bankInfo = bankInfo;
    }

    const documents = normalizeDocuments(input.documents);
    if (input.documents !== undefined) {
      user.documents = documents ?? [];
    }

    const benefits = normalizeBenefits(input.benefits);
    if (input.benefits !== undefined) {
      user.benefits = benefits ?? [];
    }

    const dependents = normalizeDependents(input.dependents);
    if (input.dependents !== undefined) {
      user.dependents = dependents ?? [];
    }

    const employmentHistory = normalizeEmploymentHistory(input.employmentHistory);
    if (input.employmentHistory !== undefined) {
      user.employmentHistory = employmentHistory ?? [];
    }

    const skills = normalizeSkills(input.skills);
    if (input.skills !== undefined) {
      user.skills = skills ?? [];
    }

    await user.save();
    return this.getUserById(tenantId, id);
  },

  async assignRole(tenantId: string, userId: string, roleId: string | null): Promise<UserResponse> {
    const tenantObjectId = validateTenant(tenantId);
    if (!Types.ObjectId.isValid(userId)) {
      throw new HttpException(400, "Invalid user ID");
    }

    const user = await UserModel.findOne({ _id: userId, tenantId: tenantObjectId });
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (roleId) {
      if (!Types.ObjectId.isValid(roleId)) {
        throw new HttpException(400, "Invalid role ID");
      }
      const role = await RoleModel.findOne({
        _id: new Types.ObjectId(roleId),
        tenantId: tenantObjectId,
      });
      if (!role) {
        throw new HttpException(404, "Role not found");
      }
      user.roleId = role._id as Types.ObjectId;
      if (Object.values(UserRole).includes(role.name as UserRole)) {
        user.role = role.name as UserRole;
      }
    } else {
      user.roleId = undefined;
    }

    await user.save();
    return this.getUserById(tenantId, user.id);
  },

  async deleteUser(tenantId: string, id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid user ID");
    }

    const tenantObjectId = validateTenant(tenantId);

    const user = await UserModel.findOne({ _id: id, tenantId: tenantObjectId });
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    user.status = UserStatus.INACTIVE;
    if (!user.terminationDate) {
      user.terminationDate = new Date();
    }

    await user.save();
  },
};
