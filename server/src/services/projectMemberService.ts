import { Types } from "mongoose";
import {
  ProjectModel,
  ProjectMemberModel,
  // ProjectMemberDoc // <- nÃ£o use o Doc em .lean(), usaremos um tipo â€œPOJOâ€ prÃ³prio abaixo
} from "../models/Client";
import { UserModel } from "../models/User";
import { HttpException } from "../utils/httpException";

/* =========================
   Tipos de Entrada / Update
   ========================= */
type ProjectMemberInput = {
  projectId: string;
  userId: string;
  role?: string;
  isLeader?: boolean;
  startDate?: string;
  endDate?: string;
};

type ProjectMemberUpdate = Partial<Omit<ProjectMemberInput, "projectId" | "userId">>;

/* =========================
   Tipos para Populados / Lean
   ========================= */
interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

interface PopulatedProject {
  _id: Types.ObjectId;
  name: string;
  description: string;
}

/** Representa o shape retornado por `.lean()` para ProjectMember */
interface ProjectMemberLean {
  _id: Types.ObjectId;
  project?: Types.ObjectId | PopulatedProject;
  user?: Types.ObjectId | PopulatedUser;
  role?: string;
  isLeader: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** SaÃ­da formatada (DTO) */
interface FormattedMember {
  id: string;
  projectId?: string;
  userId?: string;
  role?: string;
  isLeader: boolean;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
  project?: { id: string; name: string; description: string };
}

/* =========================
   Type Guards / Helpers
   ========================= */
function isObjectId(v: unknown): v is Types.ObjectId {
  return v instanceof Types.ObjectId;
}

type WithId = { _id: Types.ObjectId };

function getIdString(
  value?: Types.ObjectId | WithId
): string | undefined {
  if (!value) return undefined;
  return isObjectId(value) ? value.toString() : value._id.toString();
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new HttpException(400, `Invalid date: ${value}`);
  }
  return parsed;
}

async function ensureProjectExists(projectId: string, tenantId: string): Promise<void> {
  if (!Types.ObjectId.isValid(projectId)) {
    throw new HttpException(400, "Invalid project ID");
  }
  const exists = await ProjectModel.exists({ _id: projectId, tenantId });
  if (!exists) {
    throw new HttpException(404, "Project not found");
  }
}

async function ensureUserExists(userId: string, tenantId: string): Promise<void> {
  if (!Types.ObjectId.isValid(userId)) {
    throw new HttpException(400, "Invalid user ID");
  }
  const exists = await UserModel.exists({ _id: userId, tenantId });
  if (!exists) {
    throw new HttpException(404, "User not found");
  }
}

/* =========================
   Formatter (sem any/unknown)
   ========================= */
function formatMember(member: ProjectMemberLean): FormattedMember {
  // IDs
  const projectId = getIdString(member.project as Types.ObjectId | WithId | undefined);
  const userId = getIdString(member.user as Types.ObjectId | WithId | undefined);

  const dto: FormattedMember = {
    id: member._id.toString(),
    projectId,
    userId,
    role: member.role,
    isLeader: member.isLeader,
    startDate: member.startDate ? member.startDate.toISOString() : undefined,
    endDate: member.endDate ? member.endDate.toISOString() : undefined,
    isActive: !member.endDate,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  };

  // user populado
  if (member.user && !isObjectId(member.user)) {
    dto.user = {
      id: member.user._id.toString(),
      name: member.user.name,
      email: member.user.email,
    };
  }

  // project populado
  if (member.project && !isObjectId(member.project)) {
    dto.project = {
      id: member.project._id.toString(),
      name: member.project.name,
      description: member.project.description,
    };
  }

  return dto;
}

/* =========================
   Service
   ========================= */
export const projectMemberService = {
  /** List all members of a project */
  async listMembersByProject(tenantId: string, projectId: string) {
    await ensureProjectExists(projectId, tenantId);

    const members = await ProjectMemberModel.find({ tenantId, project: projectId })
      .populate("user", "name email")
      .populate("project", "name description")
      .sort({ isLeader: -1, startDate: -1 })
      .lean<ProjectMemberLean[]>();

    return members.map(formatMember);
  },

  /** List only active members of a project */
  async listActiveMembersByProject(tenantId: string, projectId: string) {
    await ensureProjectExists(projectId, tenantId);

    const members = await ProjectMemberModel.find({
      tenantId,
      project: projectId,
      endDate: { $exists: false },
    })
      .populate("user", "name email")
      .populate("project", "name description")
      .sort({ isLeader: -1, startDate: -1 })
      .lean<ProjectMemberLean[]>();

    return members.map(formatMember);
  },

  /** Get a specific project member by ID */
  async getMemberById(tenantId: string, memberId: string) {
    if (!Types.ObjectId.isValid(memberId)) {
      throw new HttpException(400, "Invalid member ID");
    }

    const member = await ProjectMemberModel.findOne({ _id: memberId, tenantId })
      .populate("user", "name email")
      .populate("project", "name description")
      .lean<ProjectMemberLean | null>();

    if (!member) {
      throw new HttpException(404, "Project member not found");
    }

    return formatMember(member);
  },

  /** Add a member to a project */
  async addMember(input: ProjectMemberInput & { tenantId: string }) {
    await ensureProjectExists(input.projectId, input.tenantId);
    await ensureUserExists(input.userId, input.tenantId);

    const startDate = parseDate(input.startDate);
    const endDate = parseDate(input.endDate);

    if (startDate && endDate && startDate >= endDate) {
      throw new HttpException(400, "End date must be after start date");
    }

    // Já é membro ativo?
    const existingMember = await ProjectMemberModel.findOne({
      tenantId: input.tenantId,
      project: input.projectId,
      user: input.userId,
      endDate: { $exists: false },

    if (existingMember) {
      throw new HttpException(
        409,
        "User is already an active member of this project"
      );
    }

    // se vai virar líder, remove liderança dos demais
    if (input.isLeader) {
      await ProjectMemberModel.updateMany(
        { tenantId: input.tenantId, project: input.projectId, isLeader: true },
        { $set: { isLeader: false } }
      );
    }

    const created = await ProjectMemberModel.create({
      tenantId: input.tenantId,
      project: input.projectId,
      role: input.role,
      isLeader: input.isLeader ?? false,
      startDate,
      endDate,
    });

    return this.getMemberById(input.tenantId, created.id); // id é string no Doc
  },

  /** Update a project member */
  async updateMember(tenantId: string, memberId: string, input: ProjectMemberUpdate) {
    if (!Types.ObjectId.isValid(memberId)) {
      throw new HttpException(400, "Invalid member ID");
    }

    const member = await ProjectMemberModel.findOne({ _id: memberId, tenantId });
    if (!member) {
      throw new HttpException(404, "Project member not found");
    }

    if (input.role !== undefined) member.role = input.role;

    if (input.isLeader !== undefined) {
      if (input.isLeader) {
        await ProjectMemberModel.updateMany(
        { tenantId, project: member.project, isLeader: true, _id: { $ne: member._id } },
          { $set: { isLeader: false } }
        );
      }
      member.isLeader = input.isLeader;
    }

    if (input.startDate !== undefined) {
      const sd = parseDate(input.startDate);
      if (sd) member.startDate = sd;
    }

    if (input.endDate !== undefined) {
      const ed = parseDate(input.endDate);
      if (ed) member.endDate = ed;
    }

    if (member.startDate && member.endDate && member.startDate >= member.endDate) {
      throw new HttpException(400, "End date must be after start date");
    }

    await member.save();
    return this.getMemberById(tenantId, member.id);
  },

  /** Remove (soft delete): seta endDate = hoje */
  async removeMember(tenantId: string, memberId: string) {
    if (!Types.ObjectId.isValid(memberId)) {
      throw new HttpException(400, "Invalid member ID");
    }

    const member = await ProjectMemberModel.findOne({ _id: memberId, tenantId });
    if (!member) throw new HttpException(404, "Project member not found");
    if (member.endDate) throw new HttpException(400, "Member is already inactive");

    member.endDate = new Date();
    await member.save();
  },

  /** Hard delete */
  async deleteMember(tenantId: string, memberId: string) {
    if (!Types.ObjectId.isValid(memberId)) {
      throw new HttpException(400, "Invalid member ID");
    }
    const deleted = await ProjectMemberModel.findOneAndDelete({ _id: memberId, tenantId });
    if (!deleted) throw new HttpException(404, "Project member not found");
  },

  /** Projects por usuÃ¡rio (todos) */
  async listProjectsByUser(tenantId: string, userId: string) {
    await ensureUserExists(userId, tenantId);

    const members = await ProjectMemberModel.find({ tenantId, user: userId })
      .populate("project")
      .populate({
        path: "project",
        populate: { path: "client", select: "name cnpj" },
      })
      .sort({ startDate: -1 })
      .lean<ProjectMemberLean[]>();

    return members.map(formatMember);
  },

  /** Projects por usuário (ativos) */
  async listActiveProjectsByUser(tenantId: string, userId: string) {
    await ensureUserExists(userId, tenantId);
    const members = await ProjectMemberModel.find({
      tenantId,
      user: userId,
      endDate: { $exists: false },
    })
      .populate("project")
      .populate({
        path: "project",
        populate: { path: "client", select: "name cnpj" },
      })
      .sort({ startDate: -1 })
      .lean<ProjectMemberLean[]>();
    return members.map(formatMember);
    return members.map(formatMember);
  },
};
