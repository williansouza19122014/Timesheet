
// Simulação do Supabase com dados locais
import { v4 as uuidv4 } from 'uuid';

// Tipos básicos
type User = {
  id: string;
  email: string;
  role?: string;
  created_at?: string;
};

type Customer = {
  id: string;
  company_name: string;
  cnpj: string;
  subscription_status: string;
  created_at: string;
};

type Profile = {
  id: string;
  email: string;
  role: string;
  customer_id?: string;
};

// Extensão dos tipos básicos para outras entidades que possam ser necessárias
type TimeEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  total_hours: string;
  created_at: string;
};

type ProjectTimeEntry = {
  id: string;
  time_entry_id: string;
  project_id: string;
  hours: string;
};

type VacationPeriod = {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  days_available: number;
  status: string;
};

type VacationRequest = {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: string;
  period_id: string;
};

type SystemUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

type Project = {
  id: string;
  name: string;
  client_id: string;
  status: string;
};

// Armazenamento local
const storage = {
  users: [] as User[],
  customers: [] as Customer[],
  profiles: [] as Profile[],
  time_entries: [] as TimeEntry[],
  project_time_entries: [] as ProjectTimeEntry[],
  vacation_periods: [] as VacationPeriod[],
  vacation_requests: [] as VacationRequest[],
  system_users: [] as SystemUser[],
  projects: [] as Project[],
  sessions: new Map<string, { user: User }>(),
  current_user: null as User | null,
};

// Pré-carregamento com dados de teste
const initMockData = () => {
  // Usuário administrador
  const adminId = uuidv4();
  storage.users.push({
    id: adminId,
    email: 'admin@exemplo.com',
    created_at: new Date().toISOString(),
  });

  // Cliente padrão
  const customerId = uuidv4();
  storage.customers.push({
    id: customerId,
    company_name: 'Empresa Demonstração',
    cnpj: '12.345.678/0001-90',
    subscription_status: 'active',
    created_at: new Date().toISOString(),
  });

  // Perfil do administrador
  storage.profiles.push({
    id: adminId,
    email: 'admin@exemplo.com',
    role: 'admin',
    customer_id: customerId,
  });

  // Usuário padrão para testes
  const userId = uuidv4();
  storage.users.push({
    id: userId,
    email: 'usuario@exemplo.com',
    created_at: new Date().toISOString(),
  });

  // Perfil do usuário
  storage.profiles.push({
    id: userId,
    email: 'usuario@exemplo.com',
    role: 'user',
    customer_id: customerId,
  });

  // Usuário do sistema
  storage.system_users.push({
    id: userId,
    name: 'Usuário Teste',
    email: 'usuario@exemplo.com',
    role: 'user',
    active: true,
  });

  // Projeto de exemplo
  const projectId = uuidv4();
  storage.projects.push({
    id: projectId,
    name: 'Projeto Demo',
    client_id: customerId,
    status: 'active',
  });

  // Período de férias
  const periodId = uuidv4();
  storage.vacation_periods.push({
    id: periodId,
    user_id: userId,
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    days_available: 30,
    status: 'active',
  });

  // Solicitação de férias
  storage.vacation_requests.push({
    id: uuidv4(),
    user_id: userId,
    start_date: '2023-07-01',
    end_date: '2023-07-15',
    status: 'pending',
    period_id: periodId,
  });

  // Registros de horas
  const timeEntryId = uuidv4();
  storage.time_entries.push({
    id: timeEntryId,
    user_id: userId,
    entry_date: '2023-05-15',
    total_hours: '08:00:00',
    created_at: new Date().toISOString(),
  });

  // Horas de projeto
  storage.project_time_entries.push({
    id: uuidv4(),
    time_entry_id: timeEntryId,
    project_id: projectId,
    hours: '08:00:00',
  });
};

// Inicializar dados mock
initMockData();

// Utilitários para simulação de respostas
const createResponse = (data: any = null, error: any = null) => {
  return { data, error };
};

// Melhorar as capacidades de filtragem para simulação
const filterData = (data: any[], filters: Record<string, any>) => {
  return data.filter(item => {
    for (const [key, value] of Object.entries(filters)) {
      if (item[key] !== value) return false;
    }
    return true;
  });
};

// Simulação da API do Supabase
const mockApi = (table: string) => {
  // Referência à tabela correspondente em nosso armazenamento
  let tableData: any[] = [];
  switch (table) {
    case 'users':
      tableData = storage.users;
      break;
    case 'customers':
      tableData = storage.customers;
      break;
    case 'profiles':
      tableData = storage.profiles;
      break;
    case 'time_entries':
      tableData = storage.time_entries;
      break;
    case 'project_time_entries':
      tableData = storage.project_time_entries;
      break;
    case 'vacation_periods':
      tableData = storage.vacation_periods;
      break;
    case 'vacation_requests':
      tableData = storage.vacation_requests;
      break;
    case 'system_users':
      tableData = storage.system_users;
      break;
    case 'projects':
      tableData = storage.projects;
      break;
    default:
      tableData = [];
  }

  // Funções auxiliares para criar um builder pattern similar ao Supabase
  let currentFilters: Record<string, any> = {};
  let currentData = [...tableData];
  let selectedColumns: string[] | null = null;

  const createQueryResponse = (data: any) => {
    return {
      data,
      error: null,
      single: () => createResponse(data?.length > 0 ? data[0] : null),
      maybeSingle: () => createResponse(data?.length > 0 ? data[0] : null),
      order: (column: string, options?: { ascending?: boolean }) => {
        const ascending = options?.ascending !== false;
        const sortedData = [...(Array.isArray(data) ? data : [])].sort((a, b) => {
          if (a[column] < b[column]) return ascending ? -1 : 1;
          if (a[column] > b[column]) return ascending ? 1 : -1;
          return 0;
        });
        return createQueryResponse(sortedData);
      },
      eq: (column: string, value: any) => createQueryResponse(filterData(data, { [column]: value })),
      neq: (column: string, value: any) => createQueryResponse(Array.isArray(data) ? data.filter(item => item[column] !== value) : []),
      gt: (column: string, value: any) => createQueryResponse(Array.isArray(data) ? data.filter(item => item[column] > value) : []),
      gte: (column: string, value: any) => createQueryResponse(Array.isArray(data) ? data.filter(item => item[column] >= value) : []),
      lt: (column: string, value: any) => createQueryResponse(Array.isArray(data) ? data.filter(item => item[column] < value) : []),
      lte: (column: string, value: any) => createQueryResponse(Array.isArray(data) ? data.filter(item => item[column] <= value) : []),
      is: (column: string, value: any) => createQueryResponse(Array.isArray(data) ? data.filter(item => item[column] === value) : []),
      in: (column: string, values: any[]) => createQueryResponse(Array.isArray(data) ? data.filter(item => values.includes(item[column])) : []),
      not: (column: string, value: any) => createQueryResponse(Array.isArray(data) ? data.filter(item => item[column] !== value) : []),
      select: () => createQueryResponse(data) // Adicionado para corrigir o erro no Settings.tsx
    };
  };

  // Query builder para simular a API do Supabase
  const queryBuilder = {
    select: (columns?: string) => {
      if (columns) {
        selectedColumns = columns.split(',').map(col => col.trim());
      }
      return createQueryResponse(currentData);
    },
    insert: (records: any[]) => {
      const insertedRecords = records.map(record => {
        const newRecord = {
          id: uuidv4(),
          ...record,
          created_at: record.created_at || new Date().toISOString()
        };
        tableData.push(newRecord);
        return newRecord;
      });
      return {
        ...createQueryResponse(insertedRecords),
        select: () => createQueryResponse(insertedRecords)
      };
    },
    update: (data: any) => {
      return {
        ...createQueryResponse(null),
        eq: (column: string, value: any) => {
          const index = tableData.findIndex(item => item[column] === value);
          if (index !== -1) {
            tableData[index] = { ...tableData[index], ...data };
          }
          return createQueryResponse(null);
        },
        match: (filters: Record<string, any>) => {
          tableData.forEach((item, index) => {
            let matchesAll = true;
            for (const [key, value] of Object.entries(filters)) {
              if (item[key] !== value) {
                matchesAll = false;
                break;
              }
            }
            if (matchesAll) {
              tableData[index] = { ...tableData[index], ...data };
            }
          });
          return createQueryResponse(null);
        }
      };
    },
    upsert: (records: any[], options?: any) => {
      const upsertedRecords = records.map(record => {
        if (record.id) {
          const index = tableData.findIndex(item => item.id === record.id);
          if (index !== -1) {
            tableData[index] = { ...tableData[index], ...record };
            return tableData[index];
          }
        }
        const newRecord = {
          id: record.id || uuidv4(),
          ...record,
          created_at: record.created_at || new Date().toISOString()
        };
        tableData.push(newRecord);
        return newRecord;
      });
      return createQueryResponse(upsertedRecords);
    },
    delete: () => ({
      ...createQueryResponse(null),
      eq: (column: string, value: any) => {
        const initialLength = tableData.length;
        const index = tableData.findIndex(item => item[column] === value);
        if (index !== -1) {
          tableData.splice(index, 1);
        }
        return createResponse({ count: initialLength - tableData.length });
      }
    }),
    ...createQueryResponse(currentData)
  };

  return queryBuilder;
};

// Simula operações de banco de dados
const mockRPC = (fnName: string, params: any) => {
  console.log(`Mock RPC call: ${fnName}`, params);
  
  // Implementar funções específicas do RPC
  if (fnName === 'has_permission') {
    const { permission_code } = params;
    // Para teste, sempre retornar true para permissões
    return Promise.resolve(true);
  }
  
  return Promise.resolve(null);
};

// Simula as operações do Supabase
export const mockSupabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      console.log('Mock login attempt:', { email, password });
      
      // Para testes, aceitamos qualquer senha para e-mails conhecidos
      const user = storage.users.find(u => u.email === email);
      
      if (!user) {
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials' }
        };
      }

      const session = { user, access_token: uuidv4(), expires_at: Date.now() + 3600000 };
      storage.sessions.set(session.access_token, { user });
      storage.current_user = user;

      return {
        data: { user, session },
        error: null
      };
    },

    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      console.log('Mock signup attempt:', { email, password, options });
      
      // Verificar se usuário já existe
      const existingUser = storage.users.find(u => u.email === email);
      if (existingUser) {
        return {
          data: { user: existingUser, session: null },
          error: null
        };
      }

      // Criar novo usuário
      const user = {
        id: uuidv4(),
        email,
        created_at: new Date().toISOString(),
        ...(options?.data || {})
      };

      storage.users.push(user);
      
      // Criar perfil
      storage.profiles.push({
        id: user.id,
        email: user.email,
        role: 'user',
      });

      // Criar sessão
      const session = { user, access_token: uuidv4(), expires_at: Date.now() + 3600000 };
      storage.sessions.set(session.access_token, { user });
      storage.current_user = user;

      return {
        data: { user, session },
        error: null
      };
    },

    resetPasswordForEmail: async (email: string, options?: any) => {
      console.log('Mock password reset for:', email, options);
      
      const user = storage.users.find(u => u.email === email);
      if (!user) {
        return { error: { message: 'User not found' } };
      }

      // Simulação de envio de e-mail
      console.log(`[MOCK] Password reset email sent to ${email}`);
      console.log(`[MOCK] Reset link: ${options?.redirectTo || window.location.origin}/reset-password?token=mock-token`);

      return { error: null };
    },

    updateUser: async (updates: any) => {
      console.log('Mock user update:', updates);
      
      if (!storage.current_user) {
        return { error: { message: 'No authenticated user' } };
      }
      
      if (updates.password) {
        console.log('Mock password update:', { password: updates.password });
      }
      
      const userIndex = storage.users.findIndex(u => u.id === storage.current_user?.id);
      if (userIndex !== -1) {
        storage.users[userIndex] = { ...storage.users[userIndex], ...updates };
        storage.current_user = storage.users[userIndex];
      }
      
      return { data: { user: storage.current_user }, error: null };
    },
    
    getUser: async () => {
      if (!storage.current_user) {
        return { data: { user: null }, error: null };
      }
      return { data: { user: storage.current_user }, error: null };
    },
    
    onAuthStateChange: (callback: any) => {
      // Simular evento de mudança de estado de autenticação
      console.log('Mock auth state change listener registered');
      
      // Retornar função para remover o listener
      return {
        data: { subscription: { unsubscribe: () => console.log('Mock auth listener unsubscribed') } },
        error: null
      };
    },
    
    signOut: async () => {
      console.log('Mock sign out');
      storage.current_user = null;
      return { error: null };
    }
  },

  from: (table: string) => mockApi(table),

  rpc: (fnName: string, params?: any) => mockRPC(fnName, params)
};

// Exportamos um objeto que imita a interface do Supabase
export const supabase = mockSupabase;
