import { Types } from "mongoose";
import { ClientModel, ProjectModel, ProjectMemberModel, type ClientDoc } from "../models/Client";
import { HttpException } from "../utils/httpException";

const toISOString = (value?: Date | string | null) =>
  value ? new Date(value).toISOString() : undefined;

const toObjectId = (value: unknown): Types.ObjectId => {
  if (value instanceof Types.ObjectId) {
    return value;
  }
  if (typeof value === "string" && Types.ObjectId.isValid(value)) {
    return new Types.ObjectId(value);
  }
  return new Types.ObjectId(String(value));
};

/** Tipos auxiliares */
interface ProjectMemberLean {
  _id: Types.ObjectId;
  project: Types.ObjectId;
  user?: { name?: string; email?: string };
  startDate?: Date;
  endDate?: Date;
  role?: string;
  isLeader?: boolean;
}

interface TeamMemberDTO {
  id: string;
  name: string;
  email: string;
  startDate?: string;
  endDate?: string;
  role?: string;
  isLeader: boolean;
  isActive: boolean;
}

export const clientService = {
  async listClients(tenantId: string) {
    const clients = await ClientModel.find({ tenantId }).lean<ClientDoc[]>();
    if (clients.length === 0) {
      return [];
    }

    const clientIds = clients.map((client) => toObjectId(client._id));

    const projects = await ProjectModel.find({
      tenantId,
      client: { $in: clientIds },
    }).lean();
    const projectIds = projects.map((project) => toObjectId(project._id));

    const members = await ProjectMemberModel.find({
      tenantId,
      project: { $in: projectIds },
    })
      .populate("user", "name email")
      .lean<ProjectMemberLean[]>();

    const membersByProject = new Map<string, ProjectMemberLean[]>();
    members.forEach((member) => {
      const key = member.project.toString();
      const list = membersByProject.get(key) ?? [];
      list.push(member);
      membersByProject.set(key, list);
    });

    return clients.map((client) => {
      const clientProjects = projects.filter(
        (project) => toObjectId(project.client).toString() === toObjectId(client._id).toString()
      );

      const formattedProjects = clientProjects.map((project) => {
        const projectMembers =
          membersByProject.get(toObjectId(project._id).toString()) ?? [];

        const team: TeamMemberDTO[] = projectMembers
          .filter((member) => !member.endDate)
          .map((member) => ({
            id: member._id.toString(),
            name: member.user?.name ?? "",
            email: member.user?.email ?? "",
            startDate: toISOString(member.startDate),
            endDate: undefined,
            role: member.role,
            isLeader: Boolean(member.isLeader),
            isActive: true,
          }));

        const previousMembers: TeamMemberDTO[] = projectMembers
          .filter((member) => Boolean(member.endDate))
          .map((member) => ({
            id: member._id.toString(),
            name: member.user?.name ?? "",
            email: member.user?.email ?? "",
            startDate: toISOString(member.startDate),
            endDate: toISOString(member.endDate),
            role: member.role,
            isLeader: Boolean(member.isLeader),
            isActive: false,
          }));

        const leader = team.find((member) => member.isLeader) ?? null;

        return {
          id: toObjectId(project._id).toString(),
          name: project.name,
          description: project.description,
          startDate: toISOString(project.startDate),
          endDate: toISOString(project.endDate),
          team,
          previousMembers,
          leader,
        };
      });

      return {
        id: toObjectId(client._id).toString(),
        name: client.name,
        cnpj: client.cnpj,
        startDate: toISOString(client.startDate),
        endDate: toISOString(client.endDate),
        projects: formattedProjects,
      };
    });
  },

  async getClientById(tenantId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid client ID");
    }

    const clients = await this.listClients(tenantId);
    const client = clients.find((item) => item.id === id);
    if (!client) {
      throw new HttpException(404, "Client not found");
    }
    return client;
  },

  async createClient(
    tenantId: string,
    data: {
      name: string;
      cnpj?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const client = await ClientModel.create({
      tenantId,
      name: data.name,
      cnpj: data.cnpj,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
    return this.getClientById(tenantId, client.id);
  },

  async updateClient(
    tenantId: string,
    id: string,
    data: Partial<{
      name: string;
      cnpj?: string;
      startDate?: string;
      endDate?: string;
    }>
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid client ID");
    }

    const updated = await ClientModel.findOneAndUpdate(
      { _id: id, tenantId },
      {
        ...(data.name && { name: data.name }),
        ...(data.cnpj !== undefined && { cnpj: data.cnpj }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
      },
      { new: true }
    );

    if (!updated) {
      throw new HttpException(404, "Client not found");
    }

    return this.getClientById(tenantId, updated.id);
  },

  async deleteClient(tenantId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid client ID");
    }

    const projects = await ProjectModel.find({ tenantId, client: id }).select("_id").lean();
    const projectIds = projects.map((project) => project._id);

    const result = await ClientModel.findOneAndDelete({ _id: id, tenantId });
    if (!result) {
      throw new HttpException(404, "Client not found");
    }

    if (projectIds.length > 0) {
      await ProjectMemberModel.deleteMany({ tenantId, project: { $in: projectIds } });
    }
    await ProjectModel.deleteMany({ tenantId, client: id });
  },
};
