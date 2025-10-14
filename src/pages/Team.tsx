import { useState } from "react";
import { Users, UserPlus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ROLE_LABELS, type Role } from "@/context/access-control-context";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface NewUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const ROLE_BADGE_STYLES: Record<Role, string> = {
  admin: "bg-accent/10 text-accent",
  leader: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  user: "bg-success/10 text-success",
};

const Team = () => {
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "Administrador", email: "admin@demo.com", role: "admin" },
    { id: "2", name: "Líder Operacional", email: "lider@demo.com", role: "leader" },
    { id: "3", name: "Usuário Teste", email: "usuario@demo.com", role: "user" },
  ]);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleAddUser = (event: React.FormEvent) => {
    event.preventDefault();
    const userToAdd: User = {
      id: crypto.randomUUID(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    setUsers((previous) => [...previous, userToAdd]);
    setNewUser({ name: "", email: "", password: "", role: "user" });
    setShowNewUserForm(false);

    toast({
      title: "Perfil criado",
      description: "O colaborador já pode acessar o sistema com as novas permissões.",
    });
  };

  return (
    <div className="animate-fade-in space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cadastro de perfis</h2>
          </div>
          <button
            onClick={() => setShowNewUserForm((open) => !open)}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
            type="button"
          >
            <UserPlus className="h-4 w-4" />
            Novo perfil
          </button>
        </div>

        {showNewUserForm && (
          <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">Adicionar novo perfil</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(event) => setNewUser({ ...newUser, name: event.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-slate-700 dark:bg-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email/Usuário</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-slate-700 dark:bg-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Senha provisória</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 text-sm shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-slate-700 dark:bg-slate-900"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-3 top-2.5 text-muted-foreground transition hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Perfil</label>
                  <select
                    value={newUser.role}
                    onChange={(event) => setNewUser({ ...newUser, role: event.target.value as Role })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-slate-700 dark:bg-slate-900"
                    required
                  >
                    <option value="user">{ROLE_LABELS.user}</option>
                    <option value="leader">{ROLE_LABELS.leader}</option>
                    <option value="admin">{ROLE_LABELS.admin}</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewUserForm(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
                >
                  Salvar perfil
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Gerenciamento de equipe</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/60">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Perfil</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{user.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", ROLE_BADGE_STYLES[user.role])}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;
