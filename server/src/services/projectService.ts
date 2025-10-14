import { Types } from "mongoose";
import { ProjectModel, ProjectMemberModel, ClientModel } from "../models/Client";
import { HttpException } from "../utils/httpException";

/** Tipos auxiliares */
interface PopulatedClient {
  _id: Types.ObjectId;
  name: string;
  cnpj?: string;
}

interface ProjectLean {
  _id: Types.ObjectId;
  client: Types.ObjectId | PopulatedClient;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const projectService = {
  async listProjects(tenantId: string) {
    const projects = await ProjectModel.find({ tenantId })
      .populate("client", "name cnpj")
      .sort({ createdAt: -1 })
      .lean<ProjectLean[]>();

    return projects.map((project) => ({
      id: project._id.toString(),
      clientId:
        project.client instanceof Types.ObjectId
          ? project.client.toString()
          : project.client._id.toString(),
      name: project.name,
      description: project.description,
      startDate: project.startDate?.toISOString(),
      endDate: project.endDate?.toISOString(),
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      client:
        project.client instanceof Types.ObjectId
          ? undefined
          : {
              id: project.client._id.toString(),
              name: project.client.name,
              cnpj: project.client.cnpj,
            },
    }));
  },

  async listProjectsByClient(tenantId: string, clientId: string) {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new HttpException(400, "Invalid client ID");
    }

    const clientExists = await ClientModel.exists({ _id: clientId, tenantId });
    if (!clientExists) {
      throw new HttpException(404, "Client not found");
    }

    const projects = await ProjectModel.find({ tenantId, client: clientId })
      .populate("client", "name cnpj")
      .sort({ createdAt: -1 })
      .lean<ProjectLean[]>();

    return projects.map((project) => ({
      id: project._id.toString(),
      clientId:
        project.client instanceof Types.ObjectId
          ? project.client.toString()
          : project.client._id.toString(),
      name: project.name,
      description: project.description,
      startDate: project.startDate?.toISOString(),
      endDate: project.endDate?.toISOString(),
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      client:
        project.client instanceof Types.ObjectId
          ? undefined
          : {
              id: project.client._id.toString(),
              name: project.client.name,
              cnpj: project.client.cnpj,
            },
    }));
  },

  async getProjectById(tenantId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid project ID");
    }

    const project = await ProjectModel.findOne({ _id: id, tenantId })
      .populate("client", "name cnpj")
      .lean<ProjectLean | null>();

    if (!project) {
      throw new HttpException(404, "Project not found");
    }

    // Conta membros ativos
    const membersCount = await ProjectMemberModel.countDocuments({
      tenantId,
      project: id,
      endDate: { $exists: false },
    });

    return {
      id: project._id.toString(),
      clientId:
        project.client instanceof Types.ObjectId
          ? project.client.toString()
          : project.client._id.toString(),
      name: project.name,
      description: project.description,
      startDate: project.startDate?.toISOString(),
      endDate: project.endDate?.toISOString(),
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      membersCount,
      client:
        project.client instanceof Types.ObjectId
          ? undefined
          : {
              id: project.client._id.toString(),
              name: project.client.name,
              cnpj: project.client.cnpj,
            },
    };
  },

  async createProject(
    tenantId: string,
    data: {
      clientId: string;
      name: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    if (!Types.ObjectId.isValid(data.clientId)) {
      throw new HttpException(400, "Invalid client ID");
    }

    // Verifica cliente
    const clientExists = await ClientModel.exists({ _id: data.clientId, tenantId });
    if (!clientExists) {
      throw new HttpException(404, "Client not found");
    }

    const startDate = data.startDate ? new Date(data.startDate) : undefined;
    const endDate = data.endDate ? new Date(data.endDate) : undefined;

    if (startDate && endDate && startDate >= endDate) {
      throw new HttpException(400, "End date must be after start date");
    }

    const project = await ProjectModel.create({
      tenantId: new Types.ObjectId(tenantId),
      client: data.clientId,
      name: data.name,
      description: data.description,
      startDate,
      endDate,
    });

    return this.getProjectById(tenantId, project.id);
  },

  async updateProject(
    tenantId: string,
    id: string,
    data: Partial<{
      clientId: string;
      name: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    }>
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid project ID");
    }

    const project = await ProjectModel.findOne({ _id: id, tenantId });
    if (!project) {
      throw new HttpException(404, "Project not found");
    }

    if (data.clientId) {
      if (!Types.ObjectId.isValid(data.clientId)) {
        throw new HttpException(400, "Invalid client ID");
      }
      const clientExists = await ClientModel.exists({ _id: data.clientId, tenantId });
      if (!clientExists) {
        throw new HttpException(404, "Client not found");
      }
      project.client = new Types.ObjectId(data.clientId);
    }

    if (data.name) {
      project.name = data.name;
    }
    if (data.description !== undefined) {
      project.description = data.description;
    }
    if (data.startDate) {
      project.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      project.endDate = new Date(data.endDate);
    }

    if (project.startDate && project.endDate && project.startDate >= project.endDate) {
      throw new HttpException(400, "End date must be after start date");
    }

    await project.save();
    return this.getProjectById(tenantId, project.id);
  },

  async deleteProject(tenantId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid project ID");
    }

    const project = await ProjectModel.findOneAndDelete({ _id: id, tenantId });
    if (!project) {
      throw new HttpException(404, "Project not found");
    }

    await ProjectMemberModel.deleteMany({ tenantId, project: id });
  },
};
