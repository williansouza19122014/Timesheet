import type { Response } from "express";
import { z } from "zod";
import { projectService } from "../services/projectService";
import { projectMemberService } from "../services/projectMemberService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HttpException } from "../utils/httpException";

// ==================== VALIDATION SCHEMAS ====================

const projectCreateSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const projectUpdateSchema = projectCreateSchema.partial();

const projectQuerySchema = z.object({
  clientId: z.string().optional(),
});

const projectMemberAddSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.string().optional(),
  isLeader: z.boolean().optional().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const projectMemberUpdateSchema = z.object({
  role: z.string().optional(),
  isLeader: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ==================== CONTROLLERS ====================

const ensureTenant = (req: AuthenticatedRequest) => {
  const tenantId = req.tenantId;
  if (!tenantId) {
    throw new HttpException(403, "Tenant context missing");
  }
  return tenantId;
};

export const projectController = {
  /**
   * GET /api/projects
   * List all projects with optional filters
   */
  async listProjects(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const query = projectQuerySchema.parse(req.query);
    
    if (query.clientId) {
      const projects = await projectService.listProjectsByClient(tenantId, query.clientId);
      return res.json(projects);
    }

    const projects = await projectService.listProjects(tenantId);
    return res.json(projects);
  },

  /**
   * GET /api/projects/:id
   * Get a specific project
   */
  async getProject(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const project = await projectService.getProjectById(tenantId, req.params.id);
    return res.json(project);
  },

  /**
   * POST /api/projects
   * Create a new project
   */
  async createProject(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const payload = projectCreateSchema.parse(req.body);
    const project = await projectService.createProject(tenantId, payload);
    return res.status(201).json(project);
  },

  /**
   * PUT /api/projects/:id
   * Update a project
   */
  async updateProject(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const payload = projectUpdateSchema.parse(req.body);
    const project = await projectService.updateProject(tenantId, req.params.id, payload);
    return res.json(project);
  },

  /**
   * DELETE /api/projects/:id
   * Delete a project
   */
  async deleteProject(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    await projectService.deleteProject(tenantId, req.params.id);
    return res.status(204).send();
  },

  // ==================== PROJECT MEMBERS ====================

  /**
   * GET /api/projects/:id/members
   * List all members of a project
   */
  async listMembers(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const members = await projectMemberService.listMembersByProject(tenantId, req.params.id);
    return res.json(members);
  },

  /**
   * POST /api/projects/:id/members
   * Add a member to a project
   */
  async addMember(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const payload = projectMemberAddSchema.parse(req.body);
    const member = await projectMemberService.addMember({
      tenantId,
      projectId: req.params.id,
      ...payload,
    });
    return res.status(201).json(member);
  },

  /**
   * GET /api/projects/:projectId/members/:memberId
   * Get a specific project member
   */
  async getMember(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const member = await projectMemberService.getMemberById(tenantId, req.params.memberId);
    return res.json(member);
  },

  /**
   * PUT /api/projects/:projectId/members/:memberId
   * Update a project member
   */
  async updateMember(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const payload = projectMemberUpdateSchema.parse(req.body);
    const member = await projectMemberService.updateMember(
      tenantId,
      req.params.memberId,
      payload
    );
    return res.json(member);
  },

  /**
   * DELETE /api/projects/:projectId/members/:memberId
   * Remove a member from a project (soft delete - sets endDate)
   */
  async removeMember(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    await projectMemberService.removeMember(tenantId, req.params.memberId);
    return res.status(204).send();
  },

  /**
   * GET /api/projects/:id/members/active
   * List only active members of a project
   */
  async listActiveMembers(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const members = await projectMemberService.listActiveMembersByProject(
      tenantId,
      req.params.id
    );
    return res.json(members);
  },
};
