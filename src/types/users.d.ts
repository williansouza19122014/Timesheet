
export interface SystemUser {
  id: string;
  name: string;
  email: string;
  hire_date: string;
  termination_date?: string;
  status: 'active' | 'inactive';
}
