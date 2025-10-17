export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'completed';
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'leader' | 'member';
  startDate: string;
  endDate?: string;
  hoursPerDay?: number;
}

export type ProjectCreateInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
export type ProjectUpdateInput = Partial<ProjectCreateInput>;