
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  startDate: string;
  endDate: string;
  role: string;
  isLeader?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  team: TeamMember[];
  leader?: TeamMember;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  projects: Project[];
}
