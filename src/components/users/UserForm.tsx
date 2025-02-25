
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

        const { error } = await supabase
          .from('system_users')
          .update({
            name: user.name,
            email: user.email,
            hire_date: user.hire_date,
            termination_date: user.termination_date,
            status: user.termination_date ? 'inactive' : 'active'
          })
          .eq('id', editingUser.id);

        if (error) throw error;

        // Se tem data de demissão, atualiza os projetos
        if (user.termination_date) {
          const { error: projectError } = await supabase
            .from('project_members')
            .update({
              end_date: user.termination_date
            })
            .eq('user_id', editingUser.id)
            .is('end_date', null);

          if (projectError) throw projectError;
        }
      } else {
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

  const handleConfirmTermination = async () => {
    setShowTerminationConfirm(false);
    try {
      const { error } = await supabase
        .from('system_users')
        .update({
          termination_date: user.termination_date,
          status: 'inactive'
        })
        .eq('id', editingUser?.id);

      if (error) throw error;

      // Atualiza os projetos
      const { error: projectError } = await supabase
        .from('project_members')
        .update({
          end_date: user.termination_date
        })
        .eq('user_id', editingUser?.id)
        .is('end_date', null);

      if (projectError) throw projectError;

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
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data de Admissão *</label>
              <div className="relative">
                <input
                  type="date"
                  value={user.hire_date}
                  onChange={(e) => setUser({ ...user, hire_date: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Data de Demissão</label>
              <div className="relative">
                <input
                  type="date"
                  value={user.termination_date}
                  min={user.hire_date}
                  onChange={(e) => setUser({ ...user, termination_date: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              {editingUser ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>

      <AlertDialog open={showTerminationConfirm} onOpenChange={setShowTerminationConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Desligamento</AlertDialogTitle>
            <AlertDialogDescription>
              Ao confirmar o desligamento, o usuário perderá acesso ao sistema e será removido de todos os projetos ativos.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTermination}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserForm;
