import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UserForm from "@/components/users/UserForm";
import UserCard from "@/components/users/UserCard";
import { SystemUser } from "@/types/users";
import { usePermission } from "@/hooks/usePermission";
import Forbidden from "@/components/auth/Forbidden";

const USERS_STORAGE_KEY = "tempEmployees";

const readUsersFromStorage = (): SystemUser[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SystemUser[]) : [];
  } catch (error) {
    console.error("Erro ao ler usuários do storage:", error);
    return [];
  }
};

const Users = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const { toast } = useToast();
  const { isAllowed: canViewUsers, hasPermission, isMaster } = usePermission("users.list");
  const canManageUsers =
    isMaster ||
    hasPermission("users.create") ||
    hasPermission("users.update") ||
    hasPermission("users.delete");

  const fetchUsers = useCallback(async () => {
    try {
      const storedUsers = readUsersFromStorage();
      setUsers(storedUsers);
    } catch (error: unknown) {
      console.error("Erro ao carregar usuários:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }, [toast]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user: SystemUser) => {
    setEditingUser(user);
    setShowForm(true);
  };

  if (!canViewUsers && !isMaster) {
    return <Forbidden />;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Usuários do Sistema</h1>
        {canManageUsers && (
          <button
            onClick={() => {
              setEditingUser(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-white transition-colors hover:bg-accent/90"
          >
            <Plus className="h-5 w-5" />
            Novo Usuário
          </button>
        )}
      </div>

      {showForm && canManageUsers && (
        <UserForm
          onClose={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          editingUser={editingUser}
          onSuccess={fetchUsers}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <UserCard key={user.id} user={user} onEdit={canManageUsers ? handleEdit : undefined} />
        ))}
      </div>
    </div>
  );
};

export default Users;
