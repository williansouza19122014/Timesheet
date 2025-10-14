import type { Document } from "mongoose";
import { Schema, model, Types } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface WorkSchedule {
  startTime?: string;
  endTime?: string;
}

export interface Address {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface EmergencyContact {
  name?: string;
  phone?: string;
  relationship?: string;
}

export interface PersonalInfo {
  nationality?: string;
  maritalStatus?: string;
  educationLevel?: string;
  emergencyContact?: EmergencyContact;
}

export interface BankInfo {
  bankName?: string;
  accountType?: string;
  accountNumber?: string;
  agency?: string;
}


export interface UserDocumentInfo {
  type?: string;
  number?: string;
  issueDate?: Date;
  expiryDate?: Date;
  issuer?: string;
  fileUrl?: string;
  notes?: string;
}

export interface BenefitInfo {
  name?: string;
  provider?: string;
  status?: string;
  joinDate?: Date;
  endDate?: Date;
  contribution?: number;
  notes?: string;
}

export interface DependentInfo {
  name?: string;
  relationship?: string;
  birthDate?: Date;
  document?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface EmploymentHistoryEntry {
  company?: string;
  role?: string;
  startDate?: Date;
  endDate?: Date;
  responsibilities?: string;
  achievements?: string;
  technologies?: string[];
  location?: string;
}

export interface SkillInfo {
  name?: string;
  level?: string;
  category?: string;
  certified?: boolean;
  certificationAuthority?: string;
  issuedAt?: Date;
  expiresAt?: Date;
  notes?: string;
}

export interface UserDoc extends Document {
  tenantId: Types.ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  photo?: string;
  hireDate?: Date;
  terminationDate?: Date;
  cpf?: string;
  birthDate?: Date;
  phone?: string;
  position?: string;
  department?: string;
  contractType?: string;
  workSchedule?: WorkSchedule;
  address?: Address;
  manager?: Types.ObjectId;
  additionalNotes?: string;
  workStartTime?: string;
  workEndTime?: string;
  selectedClients: Types.ObjectId[];
  selectedProjects: Types.ObjectId[];
  personalInfo?: PersonalInfo;
  bankInfo?: BankInfo;
  documents: UserDocumentInfo[];
  benefits: BenefitInfo[];
  dependents: DependentInfo[];
  employmentHistory: EmploymentHistoryEntry[];
  skills: SkillInfo[];
  roleId?: Types.ObjectId;
  isMaster: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const emergencyContactSchema = new Schema<EmergencyContact>(
  {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String },
  },
  { _id: false }
);

const personalInfoSchema = new Schema<PersonalInfo>(
  {
    nationality: { type: String },
    maritalStatus: { type: String },
    educationLevel: { type: String },
    emergencyContact: emergencyContactSchema,
  },
  { _id: false }
);

const bankInfoSchema = new Schema<BankInfo>(
  {
    bankName: { type: String },
    accountType: { type: String },
    accountNumber: { type: String },
    agency: { type: String },
  },
  { _id: false }
);


const userDocumentSchema = new Schema<UserDocumentInfo>(
  {
    type: { type: String },
    number: { type: String },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    issuer: { type: String },
    fileUrl: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const benefitSchema = new Schema<BenefitInfo>(
  {
    name: { type: String },
    provider: { type: String },
    status: { type: String },
    joinDate: { type: Date },
    endDate: { type: Date },
    contribution: { type: Number },
    notes: { type: String },
  },
  { _id: false }
);

const dependentSchema = new Schema<DependentInfo>(
  {
    name: { type: String },
    relationship: { type: String },
    birthDate: { type: Date },
    document: { type: String },
    phone: { type: String },
    email: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const employmentHistorySchema = new Schema<EmploymentHistoryEntry>(
  {
    company: { type: String },
    role: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    responsibilities: { type: String },
    achievements: { type: String },
    technologies: [{ type: String }],
    location: { type: String },
  },
  { _id: false }
);

const skillSchema = new Schema<SkillInfo>(
  {
    name: { type: String },
    level: { type: String },
    category: { type: String },
    certified: { type: Boolean },
    certificationAuthority: { type: String },
    issuedAt: { type: Date },
    expiresAt: { type: Date },
    notes: { type: String },
  },
  { _id: false }
);

const addressSchema = new Schema<Address>(
  {
    street: { type: String },
    number: { type: String },
    complement: { type: String },
    neighborhood: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
  },
  { _id: false }
);

const workScheduleSchema = new Schema<WorkSchedule>(
  {
    startTime: { type: String },
    endTime: { type: String },
  },
  { _id: false }
);

const userSchema = new Schema<UserDoc>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    email: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.EMPLOYEE,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    photo: { type: String },
    hireDate: { type: Date },
    terminationDate: { type: Date },
    cpf: { type: String },
    birthDate: { type: Date },
    phone: { type: String },
    position: { type: String },
    department: { type: String },
    contractType: { type: String },
    workSchedule: workScheduleSchema,
    address: addressSchema,
    manager: { type: Schema.Types.ObjectId, ref: "User" },
    additionalNotes: { type: String },
    workStartTime: { type: String },
    workEndTime: { type: String },
    selectedClients: [{ type: Schema.Types.ObjectId, ref: "Client" }],
    selectedProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    personalInfo: personalInfoSchema,
    bankInfo: bankInfoSchema,
    documents: { type: [userDocumentSchema], default: [] },
    benefits: { type: [benefitSchema], default: [] },
    dependents: { type: [dependentSchema], default: [] },
    employmentHistory: { type: [employmentHistorySchema], default: [] },
    skills: { type: [skillSchema], default: [] },
    roleId: { type: Schema.Types.ObjectId, ref: "Role" },
    isMaster: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const extractId = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Types.ObjectId) return value.toString();
  if (typeof value === "object" && value !== null && "_id" in value) {
    const idValue = (value as { _id?: unknown })._id;
    if (typeof idValue === "string") return idValue;
    if (idValue instanceof Types.ObjectId) return idValue.toString();
  }
  return undefined;
};

const mapIds = (values: unknown[]): string[] =>
  values
    .map((item) => extractId(item) ?? (typeof item === "string" ? item : undefined))
    .filter((item): item is string => Boolean(item));

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc: unknown, ret: any): void => {
    const record = ret as Record<string, unknown> & {
      _id?: unknown;
      passwordHash?: unknown;
      manager?: unknown;
      selectedClients?: unknown;
      selectedProjects?: unknown;
      id?: unknown;
    };

    const identifier = extractId(record._id);
    if (identifier) {
      record.id = identifier;
    }
    delete record._id;

    if (record.passwordHash !== undefined) {
      delete record.passwordHash;
    }

    if (record.manager !== undefined) {
      record.manager = extractId(record.manager) ?? record.manager;
    }

    if (Array.isArray(record.selectedClients)) {
      record.selectedClients = mapIds(record.selectedClients as unknown[]);
    }

    if (Array.isArray(record.selectedProjects)) {
      record.selectedProjects = mapIds(record.selectedProjects as unknown[]);
    }

    if (record.tenantId !== undefined) {
      record.tenantId = extractId(record.tenantId) ?? record.tenantId;
    }

    if (record.roleId !== undefined) {
      record.roleId = extractId(record.roleId) ?? record.roleId;
    }
  },
});

userSchema.set("toObject", { virtuals: true });

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, roleId: 1 });

export const UserModel = model<UserDoc>("User", userSchema);


