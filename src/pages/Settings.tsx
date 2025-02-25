
import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Server, Database, Key, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
}

interface RolePermission {
  id: string;
  role: 'admin' | 'user';
  permission_id: string;
  enabled: boolean;
}

const Settings = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | 'not-configured'>('checking');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
    fetchUserRole();
    fetchPermissions();
    fetchRolePermissions();
  }, []);

  const checkConnection = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured');
      setConnectionStatus('not-configured');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    }
  };

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchRolePermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');
      
      if (error) throw error;
      setRolePermissions(data);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
    }
  };

  const togglePermission = async (permissionId: string, role: 'admin' | 'user', currentEnabled: boolean) => {
    try {
      const { data: rolePermission, error } = await supabase
        .from('role_permissions')
        .update({ enabled: !currentEnabled })
        .eq('permission_id', permissionId)
        .eq('role', role)
        .select()
        .single();

      if (error) throw error;

      setRolePermissions(prev => 
        prev.map(rp => 
          rp.permission_id === permissionId && rp.role === role
            ? { ...rp, enabled: !currentEnabled }
            : rp
        )
      );

      toast({
        title: "Permissão atualizada",
        description: `A permissão foi ${!currentEnabled ? 'ativada' : 'desativada'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling permission:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar permissão",
        description: "Ocorreu um erro ao tentar atualizar a permissão.",
      });
    }
  };

  const SystemCard = ({ icon: Icon, title, status, description }: {
    icon: any;
    title: string;
    status: string;
    description: string;
  }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Icon className="w-6 h-6 text-accent" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium">{title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              status === 'Connected' 
                ? 'bg-success/10 text-success' 
                : status === 'Checking...'
                ? 'bg-accent/10 text-accent'
                : status === 'Not Configured'
                ? 'bg-accent/10 text-accent'
                : 'bg-destructive/10 text-destructive'
            }`}>
              {status}
            </span>
          </div>
          <p className="text-sm text-secondary">
            {connectionStatus === 'not-configured' && title === 'Supabase Connection'
              ? "Please connect Supabase using the Lovable interface"
              : description}
          </p>
        </div>
      </div>
    </div>
  );

  const PermissionsSection = () => {
    if (userRole !== 'admin') {
      return (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mt-6">
          Você precisa ser administrador para gerenciar permissões.
        </div>
      );
    }

    return (
      <div className="mt-6 space-y-6">
        <div className="grid gap-6">
          {permissions.map(permission => (
            <div key={permission.id} className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{permission.name}</h4>
                  <p className="text-sm text-muted-foreground">{permission.description}</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Administrador</Label>
                      <p className="text-xs text-muted-foreground">
                        Permissão para administradores
                      </p>
                    </div>
                    <Switch
                      checked={rolePermissions.find(
                        rp => rp.permission_id === permission.id && rp.role === 'admin'
                      )?.enabled || false}
                      onCheckedChange={(checked) => {
                        const currentRolePermission = rolePermissions.find(
                          rp => rp.permission_id === permission.id && rp.role === 'admin'
                        );
                        if (currentRolePermission) {
                          togglePermission(permission.id, 'admin', currentRolePermission.enabled);
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Usuário</Label>
                      <p className="text-xs text-muted-foreground">
                        Permissão para usuários comuns
                      </p>
                    </div>
                    <Switch
                      checked={rolePermissions.find(
                        rp => rp.permission_id === permission.id && rp.role === 'user'
                      )?.enabled || false}
                      onCheckedChange={(checked) => {
                        const currentRolePermission = rolePermissions.find(
                          rp => rp.permission_id === permission.id && rp.role === 'user'
                        );
                        if (currentRolePermission) {
                          togglePermission(permission.id, 'user', currentRolePermission.enabled);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Configurações</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <SystemCard
          icon={Server}
          title="Conexão Supabase"
          status={
            connectionStatus === 'checking' 
              ? 'Verificando...' 
              : connectionStatus === 'connected'
              ? 'Conectado'
              : connectionStatus === 'not-configured'
              ? 'Não Configurado'
              : 'Erro'
          }
          description="Status da conexão com os serviços backend do Supabase"
        />

        <SystemCard
          icon={Database}
          title="Status do Banco"
          status={connectionStatus === 'connected' ? 'Conectado' : 'Indisponível'}
          description="Status da conexão com o banco de dados PostgreSQL"
        />

        <SystemCard
          icon={Key}
          title="Autenticação"
          status={connectionStatus === 'connected' ? 'Ativo' : 'Indisponível'}
          description="Sistema de autenticação e autorização de usuários"
        />

        <SystemCard
          icon={Shield}
          title="Permissões"
          status={userRole === 'admin' ? 'Disponível' : 'Acesso Restrito'}
          description="Gerenciamento de permissões do sistema"
        />
      </div>

      <PermissionsSection />
    </div>
  );
};

export default Settings;
