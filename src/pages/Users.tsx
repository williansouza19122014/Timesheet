
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import UserForm from "@/components/users/UserForm";
import UserCard from "@/components/users/UserCard";
import { SystemUser } from "@/types/users";

const Users = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      // Temporariamente usando localStorage para desenvolvimento
      const storedUsers = localStorage.getItem('tempEmployees');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        const { data, error } = await supabase
          .from('system_users')
          .select('*')
          .order('name');

        if (error) throw error;
        setUsers(data || []);
      }
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: error.message
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: SystemUser) => {
    setEditingUser(user);
    setShowForm(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold">Usuários do Sistema</h1>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      {showForm && (
        <UserForm
          onClose={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          editingUser={editingUser}
          onSuccess={fetchUsers}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default Users;
