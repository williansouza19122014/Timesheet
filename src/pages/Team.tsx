
import { useState } from "react";
import { Users, UserPlus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface NewUser {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

const Team = () => {
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "Administrador", email: "admin", role: "admin" },
    { id: "2", name: "Usuário Teste", email: "teste", role: "user" },
  ]);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({ 
    name: "", 
    email: "", 
    password: "", 
    role: "user" 
  });
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const userToAdd: User = {
      id: String(users.length + 1),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };
    setUsers([...users, userToAdd]);
    setNewUser({ name: "", email: "", password: "", role: "user" });
    setShowNewUserForm(false);
    toast({
      title: "Usuário adicionado com sucesso!",
      description: "O novo usuário já pode fazer login no sistema.",
    });
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Cadastro de Perfil Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Cadastro de Perfil</h2>
          <button
            onClick={() => setShowNewUserForm(!showNewUserForm)}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Novo Perfil
          </button>
        </div>

        {showNewUserForm && (
          <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-medium mb-4">Adicionar Novo Perfil</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email/Usuário</label>
                  <input
                    type="text"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full p-2 border rounded-lg pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Perfil</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "admin" | "user" })}
                    className="w-full p-2 border rounded-lg"
                    required
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewUserForm(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* Gerenciamento de Equipe Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Gerenciamento de Equipe</h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-left py-3 px-4">Email/Usuário</th>
                  <th className="text-left py-3 px-4">Perfil</th>
                  <th className="text-right py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        user.role === "admin" 
                          ? "bg-accent/10 text-accent" 
                          : "bg-success/10 text-success"
                      }`}>
                        {user.role === "admin" ? "Administrador" : "Usuário"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
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
