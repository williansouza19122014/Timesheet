
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  startDate: string;
  endDate?: string;
  role: string;
  isLeader?: boolean;
  isActive?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  team: TeamMember[];
  leader?: TeamMember;
  previousMembers?: TeamMember[];
}

export interface Client {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  projects: Project[];
}
