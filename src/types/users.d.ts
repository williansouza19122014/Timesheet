
export interface SystemUser {
  id: string;
  name: string;
  email: string;
  hire_date: string;
  termination_date?: string;
  status: 'active' | 'inactive';
  cpf?: string;
  birth_date?: string;
  phone?: string;
  position?: string;
  department?: string;
  contract_type?: string;
  work_schedule?: {
    start_time: string;
    end_time: string;
  };
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  manager_id?: string;
  additional_notes?: string;
  work_start_time?: string;
  work_end_time?: string;
  photo?: string; // Added photo property as optional
}
