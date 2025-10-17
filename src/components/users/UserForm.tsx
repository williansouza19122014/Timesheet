import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import UserFormFields from "./UserFormFields";
import UserFormActions from "./UserFormActions";
import TerminationConfirmDialog from "./TerminationConfirmDialog";
import { SystemUser } from "@/types/users";
import { useAccessControl } from "@/context/access-control-context";

const USERS_STORAGE_KEY = "tempEmployees";

const readUsers = (): SystemUser[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SystemUser[]) : [];
  } catch (error) {
    console.error("Erro ao ler usuarios do storage:", error);
    return [];
  }
};

const writeUsers = (users: SystemUser[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const upsertUser = (user: SystemUser) => {
  const users = readUsers();
  const index = users.findIndex((item) => item.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  writeUsers(users);
};

interface UserFormProps {
  onClose: () => void;
  editingUser?: SystemUser | null;
  onSuccess: () => void;
}

const UserForm = ({ onClose, editingUser, onSuccess }: UserFormProps) => {
  const { roleDefinitions } = useAccessControl();
  const { toast } = useToast();

  const defaultRoleId = useMemo(() => {
    if (editingUser?.accessRole) {
      return editingUser.accessRole;
    }
    return (
      roleDefinitions.find((role) => role.id === "user")?.id ?? roleDefinitions[0]?.id ?? ""
    );
  }, [editingUser?.accessRole, roleDefinitions]);

  const roleOptions = useMemo(
    () => roleDefinitions.map((role) => ({ id: role.id, name: role.name })),
    [roleDefinitions]
  );

  const [user, setUser] = useState<SystemUser>({
    id: editingUser?.id ?? crypto.randomUUID(),
    name: editingUser?.name ?? "",
    email: editingUser?.email ?? "",
    hire_date: editingUser?.hire_date ?? new Date().toISOString().split("T")[0],
    termination_date: editingUser?.termination_date ?? "",
    status: editingUser?.status ?? "active",
    accessRole: editingUser?.accessRole ?? defaultRoleId,
  });
  const [showTerminationConfirm, setShowTerminationConfirm] = useState(false);

  useEffect(() => {
    setUser((previous) => ({
      ...previous,
      accessRole: editingUser?.accessRole ?? defaultRoleId,
    }));
  }, [editingUser?.id, editingUser?.accessRole, defaultRoleId]);

  const handleFieldChange = (field: string, value: string) => {
    setUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const persistUser = (next: SystemUser) => {
    const normalized: SystemUser = {
      ...next,
      accessRole: next.accessRole || defaultRoleId,
      status: next.termination_date ? "inactive" : "active",
    };
    upsertUser(normalized);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!user.name || !user.email || !user.hire_date || !user.accessRole) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatorios",
      });
      return;
    }

    if (editingUser && user.termination_date && !editingUser.termination_date) {
      setShowTerminationConfirm(true);
      return;
    }

    try {
      persistUser(user);

      toast({
        title: `Usuario ${editingUser ? "atualizado" : "cadastrado"} com sucesso!`,
        description: user.name,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar usuario:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar usuario",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleConfirmTermination = () => {
    setShowTerminationConfirm(false);
    try {
      persistUser(user);
      toast({
        title: "Usuario desligado com sucesso",
        description: `${user.name} foi marcado como inativo`,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao desligar usuario:", error);
      toast({
        variant: "destructive",
        title: "Erro ao desligar usuario",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold">{editingUser ? "Editar Usuario" : "Novo Usuario"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <UserFormFields user={user} roles={roleOptions} onChange={handleFieldChange} />
          <UserFormActions isEditing={Boolean(editingUser)} onCancel={onClose} />
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
