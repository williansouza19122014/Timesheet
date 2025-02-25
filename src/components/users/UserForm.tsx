
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import UserFormFields from "./UserFormFields";
import UserFormActions from "./UserFormActions";
import TerminationConfirmDialog from "./TerminationConfirmDialog";

interface UserFormProps {
  onClose: () => void;
  editingUser?: SystemUser;
  onSuccess: () => void;
}

interface SystemUser {
  id: string;
  name: string;
  email: string;
  hire_date: string;
  termination_date?: string;
  status: 'active' | 'inactive';
}

const UserForm = ({ onClose, editingUser, onSuccess }: UserFormProps) => {
  const [user, setUser] = useState<Partial<SystemUser>>(editingUser || {
    name: "",
    email: "",
    hire_date: new Date().toISOString().split('T')[0],
    termination_date: "",
    status: 'active'
  });
  const [showTerminationConfirm, setShowTerminationConfirm] = useState(false);
  const { toast } = useToast();

  const handleFieldChange = (field: string, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user.name || !user.email || !user.hire_date) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }

    try {
      if (editingUser) {
        if (user.termination_date && !editingUser.termination_date) {
          setShowTerminationConfirm(true);
          return;
        }

        await updateUser();
      } else {
        await createUser();
      }

      toast({
        title: `Usuário ${editingUser ? 'atualizado' : 'cadastrado'} com sucesso!`,
        description: user.name
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar usuário",
        description: error.message
      });
    }
  };

  const updateUser = async () => {
    const { error } = await supabase
      .from('system_users')
      .update({
        name: user.name,
        email: user.email,
        hire_date: user.hire_date,
        termination_date: user.termination_date,
        status: user.termination_date ? 'inactive' : 'active'
      })
      .eq('id', editingUser?.id);

    if (error) throw error;

    if (user.termination_date) {
      const { error: projectError } = await supabase
        .from('project_members')
        .update({
          end_date: user.termination_date
        })
        .eq('user_id', editingUser?.id)
        .is('end_date', null);

      if (projectError) throw projectError;
    }
  };

  const createUser = async () => {
    const { error } = await supabase
      .from('system_users')
      .insert([{
        name: user.name,
        email: user.email,
        hire_date: user.hire_date,
        termination_date: user.termination_date,
        status: user.termination_date ? 'inactive' : 'active'
      }]);

    if (error) throw error;
  };

  const handleConfirmTermination = async () => {
    setShowTerminationConfirm(false);
    try {
      await updateUser();
      
      toast({
        title: "Usuário desligado com sucesso",
        description: `${user.name} foi marcado como inativo`
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao desligar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao desligar usuário",
        description: error.message
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">
          {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <UserFormFields 
            user={user}
            onChange={handleFieldChange}
          />
          
          <UserFormActions
            isEditing={!!editingUser}
            onCancel={onClose}
          />
        </form>
      </div>

      <TerminationConfirmDialog
        open={showTerminationConfirm}
        onOpenChange={setShowTerminationConfirm}
        onConfirm={handleConfirmTermination}
      />
    </div>
  );
};

export default UserForm;
