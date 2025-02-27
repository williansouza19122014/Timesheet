
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

// Armazenamento local
const storage = {
  users: [] as User[],
  customers: [] as Customer[],
  profiles: [] as Profile[],
  sessions: new Map<string, { user: User }>(),
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
};

// Inicializar dados mock
initMockData();

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

      return {
        data: { user, session },
        error: null
      };
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      console.log('Mock signup attempt:', { email, password });
      
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

    updateUser: async ({ password }: { password: string }) => {
      console.log('Mock password update:', { password });
      return { error: null };
    },
  },

  from: (table: string) => {
    return {
      select: () => {
        return {
          eq: (column: string, value: any) => {
            let results: any[] = [];
            
            if (table === 'profiles') {
              results = storage.profiles.filter(p => p[column as keyof Profile] === value);
            } else if (table === 'customers') {
              results = storage.customers.filter(c => c[column as keyof Customer] === value);
            }
            
            return {
              data: results,
              error: null,
              single: () => ({
                data: results.length > 0 ? results[0] : null,
                error: results.length === 0 ? { message: 'No rows found' } : null
              })
            };
          }
        };
      },

      insert: (records: any[]) => {
        console.log(`Mock insert into ${table}:`, records);

        let insertedRecords: any[] = [];

        if (table === 'customers') {
          records.forEach(record => {
            const newCustomer = {
              id: uuidv4(),
              ...record,
              created_at: new Date().toISOString()
            };
            storage.customers.push(newCustomer as Customer);
            insertedRecords.push(newCustomer);
          });
        }

        return {
          select: () => ({
            data: insertedRecords,
            error: null,
            single: () => ({
              data: insertedRecords.length > 0 ? insertedRecords[0] : null,
              error: null
            })
          })
        };
      },

      update: (data: any) => {
        return {
          eq: (column: string, value: any) => {
            console.log(`Mock update ${table} where ${column} = ${value}:`, data);
            
            if (table === 'profiles') {
              const index = storage.profiles.findIndex(p => p[column as keyof Profile] === value);
              if (index !== -1) {
                storage.profiles[index] = { ...storage.profiles[index], ...data };
              }
            }
            
            return { error: null };
          }
        };
      }
    };
  }
};

// Exportamos um objeto que imita a interface do Supabase
export const supabase = mockSupabase;
