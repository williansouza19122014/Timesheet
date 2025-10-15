import { Types } from "mongoose";
import { ProjectModel, ProjectMemberModel } from "../models/Client";
import { UserModel } from "../models/User";
import { HttpException } from "../utils/httpException";

type ProjectMemberInput = {
  projectId: string;
  userId: string;
  role?: string;
  isLeader?: boolean;
  startDate?: string;
  endDate?: string;
};

type ProjectMemberUpdate = Partial<Omit<ProjectMemberInput, "projectId" | "userId">>;

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

function isObjectId(value: unknown): value is Types.ObjectId {
  return value instanceof Types.ObjectId;
}

type WithId = { _id: Types.ObjectId };

function toIdString(value?: Types.ObjectId | WithId): string | undefined {
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

function formatMember(member: ProjectMemberLean): FormattedMember {
  const projectId = toIdString(member.project as Types.ObjectId | WithId | undefined);
  const userId = toIdString(member.user as Types.ObjectId | WithId | undefined);

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

  if (member.user && !isObjectId(member.user)) {
    dto.user = {
      id: member.user._id.toString(),
      name: member.user.name,
      email: member.user.email,
    };
  }

  if (member.project && !isObjectId(member.project)) {
    dto.project = {
      id: member.project._id.toString(),
      name: member.project.name,
      description: member.project.description,
    };
  }

  return dto;
}

export const projectMemberService = {
  async listMembersByProject(tenantId: string, projectId: string) {
    await ensureProjectExists(projectId, tenantId);

    const members = await ProjectMemberModel.find({ tenantId, project: projectId })
      .populate("user", "name email")
      .populate("project", "name description")
      .sort({ isLeader: -1, startDate: -1 })
      .lean<ProjectMemberLean[]>();

    return members.map(formatMember);
  },

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

  async addMember(input: ProjectMemberInput & { tenantId: string }) {
    await ensureProjectExists(input.projectId, input.tenantId);
    await ensureUserExists(input.userId, input.tenantId);

    const startDate = parseDate(input.startDate);
    const endDate = parseDate(input.endDate);

    if (startDate && endDate && startDate >= endDate) {
      throw new HttpException(400, "End date must be after start date");
    }

    const existingMember = await ProjectMemberModel.findOne({
      tenantId: input.tenantId,
      project: input.projectId,
      user: input.userId,
      endDate: { $exists: false },
    });

    if (existingMember) {
      throw new HttpException(409, "User is already an active member of this project");
    }

    if (input.isLeader) {
      await ProjectMemberModel.updateMany(
        { tenantId: input.tenantId, project: input.projectId, isLeader: true },
        { $set: { isLeader: false } }
      );
    }

    const created = await ProjectMemberModel.create({
      tenantId: input.tenantId,
      project: input.projectId,
      user: input.userId,
      role: input.role,
      isLeader: input.isLeader ?? false,
      startDate,
      endDate,
    });

    return this.getMemberById(input.tenantId, created.id);
  },

  async updateMember(tenantId: string, memberId: string, input: ProjectMemberUpdate) {
    if (!Types.ObjectId.isValid(memberId)) {
      throw new HttpException(400, "Invalid member ID");
    }

    const member = await ProjectMemberModel.findOne({ _id: memberId, tenantId });
    if (!member) {
      throw new HttpException(404, "Project member not found");
    }

    if (input.role !== undefined) {
      member.role = input.role;
    }

    if (input.isLeader !== undefined) {
      if (input.isLeader) {
        await ProjectMemberModel.updateMany(
          {
            tenantId,
            project: member.project,
            isLeader: true,
            _id: { $ne: member._id },
          },
          { $set: { isLeader: false } }
        );
      }
      member.isLeader = input.isLeader;
    }

    if (input.startDate !== undefined) {
      const start = parseDate(input.startDate);
      if (start) member.startDate = start;
    }

    if (input.endDate !== undefined) {
      const end = parseDate(input.endDate);
      if (end) member.endDate = end;
    }

    if (member.startDate && member.endDate && member.startDate >= member.endDate) {
      throw new HttpException(400, "End date must be after start date");
    }

    await member.save();
    return this.getMemberById(tenantId, member.id);
  },

  async removeMember(tenantId: string, memberId: string) {
    if (!Types.ObjectId.isValid(memberId)) {
      throw new HttpException(400, "Invalid member ID");
    }

    const member = await ProjectMemberModel.findOne({ _id: memberId, tenantId });
    if (!member) {
      throw new HttpException(404, "Project member not found");
    }
    if (member.endDate) {
      throw new HttpException(400, "Member is already inactive");
    }

    member.endDate = new Date();
    await member.save();
  },

  async deleteMember(tenantId: string, memberId: string) {
    if (!Types.ObjectId.isValid(memberId)) {
      throw new HttpException(400, "Invalid member ID");
    }

    const deleted = await ProjectMemberModel.findOneAndDelete({ _id: memberId, tenantId });
    if (!deleted) {
      throw new HttpException(404, "Project member not found");
    }
  },

  async listProjectsByUser(tenantId: string, userId: string) {
    await ensureUserExists(userId, tenantId);

    const members = await ProjectMemberModel.find({ tenantId, user: userId })
      .populate({
        path: "project",
        populate: { path: "client", select: "name cnpj" },
      })
      .sort({ startDate: -1 })
      .lean<ProjectMemberLean[]>();

    return members.map(formatMember);
  },

  async listActiveProjectsByUser(tenantId: string, userId: string) {
    await ensureUserExists(userId, tenantId);

    const members = await ProjectMemberModel.find({
      tenantId,
      user: userId,
      endDate: { $exists: false },
    })
      .populate({
        path: "project",
        populate: { path: "client", select: "name cnpj" },
      })
      .sort({ startDate: -1 })
      .lean<ProjectMemberLean[]>();

    return members.map(formatMember);
  },
};
