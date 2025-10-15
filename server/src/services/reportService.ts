
import { Types } from "mongoose";
import type { FilterQuery, PipelineStage } from "mongoose";
import {
  TimeEntryModel,
  TimeEntryAllocationModel,
  type TimeEntryDoc,
} from "../models/TimeEntry";
import {
  ProjectModel,
  ProjectMemberModel,
  type ProjectDoc,
  type ProjectMemberDoc,
} from "../models/Client";
import {
  VacationRequestModel,
  VacationRequestStatus,
  type VacationRequestDoc,
} from "../models/Vacation";
import { UserModel, UserRole } from "../models/User";
import { HttpException } from "../utils/httpException";

const validateTenant = (tenantId: string): Types.ObjectId => {
  if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
    throw new HttpException(400, "Invalid tenant context");
  }
  return new Types.ObjectId(tenantId);
};


interface Actor {
  id: string;
  role: UserRole;
}

type TimeSummaryFilters = {
  projectId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
};

type ProjectPerformanceFilters = {
  startDate?: string;
  endDate?: string;
  onlyActive?: boolean;
};

type VacationSummaryFilters = {
  startDate?: string;
  endDate?: string;
  status?: VacationRequestStatus;
};

type UserWorkloadFilters = {
  projectId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
};

const isManager = (actor: Actor) =>
  actor.role === UserRole.ADMIN || actor.role === UserRole.MANAGER;

const ensureObjectId = (value: string, label: string) => {
  if (!Types.ObjectId.isValid(value)) {
    throw new HttpException(400, `Invalid ${label}`);
  }
  return new Types.ObjectId(value);
};

const parseDateRange = (start?: string, end?: string) => {
  const range: { start?: Date; end?: Date } = {};
  if (start) {
    const parsed = new Date(start);
    if (Number.isNaN(parsed.getTime())) {
      throw new HttpException(400, "Invalid startDate");
    }
    range.start = parsed;
  }
  if (end) {
    const parsed = new Date(end);
    if (Number.isNaN(parsed.getTime())) {
      throw new HttpException(400, "Invalid endDate");
    }
    parsed.setUTCHours(23, 59, 59, 999);
    range.end = parsed;
  }
  if (range.start && range.end && range.start > range.end) {
    throw new HttpException(400, "startDate must be before endDate");
  }
  return range;
};

const applyDateMatch = <T extends { date?: unknown }>(
  query: FilterQuery<T>,
  range: { start?: Date; end?: Date }
) => {
  if (!range.start && !range.end) {
    return query;
  }
  query.date = {} as Record<string, Date>;
  if (range.start) {
    (query.date as Record<string, Date>).$gte = range.start;
  }
  if (range.end) {
    (query.date as Record<string, Date>).$lte = range.end;
  }
  return query;
};

const resolveAccessibleProjectIds = async (tenantId: Types.ObjectId, actor: Actor) => {
  if (isManager(actor)) {
    return null; // no restriction
  }
  const memberships = await ProjectMemberModel.find({
    tenantId,
    user: ensureObjectId(actor.id, "userId"),
    $or: [{ endDate: { $exists: false } }, { endDate: null }],
  }).select("project");
  const ids = memberships.map((member) => member.project as Types.ObjectId);
  return ids.length ? ids : [];
};

const ensureProjectPermission = async (
  tenantId: Types.ObjectId,
  projectId: string,
  actor: Actor
) => {
  const projectObjectId = ensureObjectId(projectId, "projectId");
  const exists = await ProjectModel.exists({ _id: projectObjectId, tenantId });
  if (!exists) {
    throw new HttpException(404, "Project not found");
  }
  if (isManager(actor)) {
    return projectObjectId;
  }
  const membership = await ProjectMemberModel.exists({
    tenantId,
    project: projectObjectId,
    user: ensureObjectId(actor.id, "userId"),
    $or: [{ endDate: { $exists: false } }, { endDate: null }],
  });
  if (!membership) {
    throw new HttpException(403, "You are not part of this project");
  }
  return projectObjectId;
};

const ensureUserVisibility = async (
  tenantId: Types.ObjectId,
  filters: { userId?: string },
  actor: Actor
) => {
  if (filters.userId) {
    if (!isManager(actor) && filters.userId !== actor.id) {
      throw new HttpException(403, "You cannot view other user's data");
    }
    const userId = ensureObjectId(filters.userId, "userId");
    const exists = await UserModel.exists({ _id: userId, tenantId });
    if (!exists) {
      throw new HttpException(404, "User not found");
    }
    return userId;
  }
  if (!isManager(actor)) {
    const userId = ensureObjectId(actor.id, "userId");
    const exists = await UserModel.exists({ _id: userId, tenantId });
    if (!exists) {
      throw new HttpException(404, "User not found");
    }
    return userId;
  }
  return undefined;
};

const buildTimeEntryPipeline = async (
  baseMatch: FilterQuery<TimeEntryDoc>,
  projectId?: Types.ObjectId
): Promise<PipelineStage[]> => {
  const pipeline: PipelineStage[] = [
    { $match: baseMatch },
    {
      $lookup: {
        from: "timeentryallocations",
        localField: "_id",
        foreignField: "timeEntry",
        as: "allocations",
      },
    },
    {
      $unwind: {
        path: "$allocations",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (projectId) {
    pipeline.push({
      $match: {
        $or: [
          { "allocations.project": projectId },
          { allocations: { $exists: false } },
          { allocations: null },
        ],
      },
    });
  }

  pipeline.push({
    $addFields: {
      allocationHours: { $ifNull: ["$allocations.hours", 0] },
      allocationProject: "$allocations.project",
    },
  });

  return pipeline;
};

const sumHoursFromPipeline = async (
  basePipeline: PipelineStage[]
) => {
  const summary = await TimeEntryModel.aggregate([
    ...basePipeline,
    {
      $group: {
        _id: null,
        totalHours: { $sum: "$allocationHours" },
        entries: { $addToSet: "$_id" },
      },
    },
    {
      $project: {
        _id: 0,
        totalHours: 1,
        totalEntries: { $size: "$entries" },
      },
    },
  ]);

  return summary[0] ?? { totalHours: 0, totalEntries: 0 };
};

const sumHoursByUser = async (
  basePipeline: PipelineStage[]
) => {
  const results = await TimeEntryModel.aggregate([
    ...basePipeline,
    {
      $group: {
        _id: "$user",
        totalHours: { $sum: "$allocationHours" },
        entries: { $addToSet: "$_id" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        userId: { $toString: "$_id" },
        name: "$user.name",
        email: "$user.email",
        totalHours: 1,
        totalEntries: { $size: "$entries" },
      },
    },
    { $sort: { totalHours: -1 } },
  ]);

  return results;
};

const sumHoursByProject = async (
  basePipeline: PipelineStage[]
) => {
  const results = await TimeEntryModel.aggregate([
    ...basePipeline,
    { $match: { allocationProject: { $ne: null } } },
    {
      $group: {
        _id: "$allocationProject",
        totalHours: { $sum: "$allocationHours" },
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "_id",
        foreignField: "_id",
        as: "project",
      },
    },
    { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        projectId: { $toString: "$_id" },
        name: "$project.name",
        totalHours: 1,
      },
    },
    { $sort: { totalHours: -1 } },
  ]);

  return results;
};

const sumHoursByDay = async (
  basePipeline: PipelineStage[]
) => {
  const results = await TimeEntryModel.aggregate([
    ...basePipeline,
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        totalHours: { $sum: "$allocationHours" },
        entries: { $addToSet: "$_id" },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        totalHours: 1,
        totalEntries: { $size: "$entries" },
      },
    },
    { $sort: { date: 1 } },
  ]);

  return results;
};

const aggregateHoursByProject = async (
  tenantId: Types.ObjectId,
  projectIds: Types.ObjectId[],
  range: { start?: Date; end?: Date }
) => {
  if (!projectIds.length) {
    return new Map<string, number>();
  }

  const pipeline: PipelineStage[] = [
    { $match: { tenantId, project: { $in: projectIds } } },
    {
      $lookup: {
        from: "timeentries",
        localField: "timeEntry",
        foreignField: "_id",
        as: "entry",
      },
    },
    { $unwind: "$entry" },
    { $match: { "entry.tenantId": tenantId } },
  ];

  if (range.start || range.end) {
    const dateMatch: Record<string, Date> = {};
    if (range.start) {
      dateMatch.$gte = range.start;
    }
    if (range.end) {
      dateMatch.$lte = range.end;
    }
    pipeline.push({ $match: { "entry.date": dateMatch } });
  }

  pipeline.push({
    $group: {
      _id: "$project",
      totalHours: { $sum: "$hours" },
    },
  });

  const results = await TimeEntryAllocationModel.aggregate(pipeline);

  return new Map<string, number>(
    results.map((item) => [item._id.toString(), item.totalHours || 0])
  );
};

export const reportService = {
  async getTimeSummary(
    tenantId: string,
    filters: TimeSummaryFilters,
    actor: Actor
  ) {
    const tenantObjectId = validateTenant(tenantId);
    const range = parseDateRange(filters.startDate, filters.endDate);

    const match: FilterQuery<TimeEntryDoc> = { tenantId: tenantObjectId };
    if (range.start || range.end) {
      applyDateMatch(match, range);
    }

    const userObjectId = await ensureUserVisibility(
      tenantObjectId,
      { userId: filters.userId },
      actor
    );
    if (userObjectId) {
      match.user = userObjectId;
    }

    let projectObjectId: Types.ObjectId | undefined;
    if (filters.projectId) {
      projectObjectId = await ensureProjectPermission(tenantObjectId, filters.projectId, actor);
      match.project = projectObjectId;
    }

    const pipeline = await buildTimeEntryPipeline(match, projectObjectId);

    const [summary, byUser, byProject, byDay] = await Promise.all([
      sumHoursFromPipeline(pipeline),
      sumHoursByUser(pipeline),
      sumHoursByProject(pipeline),
      sumHoursByDay(pipeline),
    ]);

    return {
      range: {
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
      totalHours: summary.totalHours || 0,
      totalEntries: summary.totalEntries || 0,
      byUser,
      byProject,
      byDay,
    };
  },

  async getProjectPerformance(
    tenantId: string,
    filters: ProjectPerformanceFilters,
    actor: Actor
  ) {
    const tenantObjectId = validateTenant(tenantId);
    const range = parseDateRange(filters.startDate, filters.endDate);

    const accessibleProjects = await resolveAccessibleProjectIds(tenantObjectId, actor);
    if (Array.isArray(accessibleProjects) && accessibleProjects.length === 0) {
      return { projects: [] };
    }

    const projectMatch: FilterQuery<ProjectDoc> = { tenantId: tenantObjectId };
    if (filters.onlyActive) {
      projectMatch.$or = [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: new Date() } },
      ];
    }

    if (filters.startDate) {
      projectMatch.startDate = projectMatch.startDate || {};
      (projectMatch.startDate as Record<string, Date>).$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      projectMatch.endDate = projectMatch.endDate || {};
      (projectMatch.endDate as Record<string, Date>).$lte = new Date(filters.endDate);
    }

    if (accessibleProjects) {
      projectMatch._id = { $in: accessibleProjects };
    }

    const projects = await ProjectModel.find(projectMatch)
      .populate("client", "name")
      .lean<ProjectDoc[]>();

    if (!projects.length) {
      return { projects: [] };
    }

    const projectIds = projects.map((project) => project._id as Types.ObjectId);
    const hoursByProject = await aggregateHoursByProject(tenantObjectId, projectIds, range);

    const memberStats = await ProjectMemberModel.aggregate([
      { $match: { tenantId: tenantObjectId, project: { $in: projectIds } } },
      {
        $group: {
          _id: "$project",
          totalMembers: { $sum: 1 },
          activeMembers: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $not: "$endDate" },
                    { $eq: ["$endDate", null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const memberMap = new Map(
      memberStats.map((item) => [item._id.toString(), item])
    );

    const formatted = projects.map((project) => {
      const projectId = (project._id as Types.ObjectId).toString();
      const hours = hoursByProject.get(projectId) ?? 0;
      const stats = memberMap.get(projectId);
      const totalMembers = stats?.totalMembers ?? 0;
      const activeMembers = stats?.activeMembers ?? 0;
      const avgHoursPerMember =
        activeMembers > 0 ? Number((hours / activeMembers).toFixed(2)) : 0;
      const isActive = !project.endDate || project.endDate >= new Date();

      return {
        projectId,
        name: project.name,
        clientName: (project as any).client?.name,
        startDate: project.startDate?.toISOString(),
        endDate: project.endDate?.toISOString(),
        isActive,
        totalMembers,
        activeMembers,
        totalHours: hours,
        avgHoursPerMember,
      };
    });

    return { projects: formatted };
  },

  async getVacationSummary(
    tenantId: string,
    filters: VacationSummaryFilters,
    actor: Actor
  ) {
    const tenantObjectId = validateTenant(tenantId);
    const range = parseDateRange(filters.startDate, filters.endDate);

    const match: FilterQuery<VacationRequestDoc> = { tenantId: tenantObjectId };
    if (!isManager(actor)) {
      match.user = ensureObjectId(actor.id, "userId");
    }
    if (filters.status) {
      match.status = filters.status;
    }

    if (range.start || range.end) {
      match.startDate = {} as Record<string, Date>;
      if (range.start) {
        (match.startDate as Record<string, Date>).$gte = range.start;
      }
      if (range.end) {
        (match.startDate as Record<string, Date>).$lte = range.end;
      }
    }

    const requests = await VacationRequestModel.find(match)
      .populate({
        path: "user",
        select: "name email",
        match: { tenantId: tenantObjectId },
      })
      .lean<VacationRequestDoc[]>();

    const totalRequests = requests.length;
    const totalDaysTaken = requests.reduce(
      (acc, request) => acc + (request.daysTaken || 0) + (request.soldDays || 0),
      0
    );

    const byStatusMap = new Map<VacationRequestStatus, { count: number; days: number }>();
    requests.forEach((request) => {
      const current = byStatusMap.get(request.status) ?? { count: 0, days: 0 };
      current.count += 1;
      current.days += (request.daysTaken || 0) + (request.soldDays || 0);
      byStatusMap.set(request.status, current);
    });

    const byStatus = Array.from(byStatusMap.entries()).map(([status, stats]) => ({
      status,
      totalRequests: stats.count,
      totalDays: stats.days,
    }));

    const byUserMap = new Map<
      string,
      { name?: string; email?: string; requests: number; days: number }
    >();

    requests.forEach((request) => {
      const userId = request.user.toString();
      const current =
        byUserMap.get(userId) ?? {
          name: (request as any).user?.name,
          email: (request as any).user?.email,
          requests: 0,
          days: 0,
        };
      current.requests += 1;
      current.days += (request.daysTaken || 0) + (request.soldDays || 0);
      byUserMap.set(userId, current);
    });

    const byUser = Array.from(byUserMap.entries()).map(([userId, stats]) => ({
      userId,
      name: stats.name,
      email: stats.email,
      totalRequests: stats.requests,
      totalDays: stats.days,
    }));

    return {
      range: {
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
      totalRequests,
      totalDaysTaken,
      byStatus,
      byUser,
    };
  },

  async getUserWorkload(
    tenantId: string,
    filters: UserWorkloadFilters,
    actor: Actor
  ) {
    const tenantObjectId = validateTenant(tenantId);
    const range = parseDateRange(filters.startDate, filters.endDate);

    const match: FilterQuery<TimeEntryDoc> = { tenantId: tenantObjectId };
    applyDateMatch(match, range);

    let projectObjectId: Types.ObjectId | undefined;
    if (filters.projectId) {
      projectObjectId = await ensureProjectPermission(tenantObjectId, filters.projectId, actor);
    }

    const userObjectId = await ensureUserVisibility(
      tenantObjectId,
      { userId: filters.userId },
      actor
    );
    if (userObjectId) {
      match.user = userObjectId;
    }

    const pipeline = await buildTimeEntryPipeline(match, projectObjectId);

    const workload = await TimeEntryModel.aggregate([
      ...pipeline,
      {
        $group: {
          _id: {
            user: "$user",
            project: "$allocationProject",
          },
          totalHours: { $sum: "$allocationHours" },
        },
      },
      {
        $group: {
          _id: "$_id.user",
          projects: {
            $push: {
              projectId: {
                $cond: [
                  { $ifNull: ["$_id.project", false] },
                  { $toString: "$_id.project" },
                  null
                ],
              },
              totalHours: "$totalHours",
            },
          },
          totalHours: { $sum: "$totalHours" },
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$userId"] },
                    { $eq: ["$tenantId", tenantObjectId] },
                  ],
                },
              },
            },
          ],
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: { $toString: "$_id" },
          name: "$user.name",
          email: "$user.email",
          totalHours: 1,
          projects: {
            $filter: {
              input: "$projects",
              as: "project",
              cond: { $ne: ["$$project.projectId", null] },
            },
          },
        },
      },
      { $sort: { totalHours: -1 } },
    ]);

    return {
      range: {
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
      users: workload,
    };
  },
};
