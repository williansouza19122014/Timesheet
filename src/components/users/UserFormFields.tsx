import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleOption {
  id: string;
  name: string;
}

interface UserFormFieldsProps {
  user: {
    name: string;
    email: string;
    hire_date: string;
    termination_date?: string;
    accessRole: string;
  };
  roles: RoleOption[];
  onChange: (field: string, value: string) => void;
}

const UserFormFields = ({ user, roles, onChange }: UserFormFieldsProps) => {
  const hasRoles = roles.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Nome *</Label>
        <Input id="name" type="text" value={user.name} onChange={(e) => onChange("name", e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" value={user.email} onChange={(e) => onChange("email", e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="access_role">Perfil de acesso *</Label>
        <Select
          value={user.accessRole}
          onValueChange={(value) => onChange("accessRole", value)}
          disabled={!hasRoles}
        >
          <SelectTrigger id="access_role">
            <SelectValue placeholder={hasRoles ? "Selecione um perfil" : "Nenhum perfil disponivel"} />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!hasRoles && (
          <p className="mt-1 text-xs text-amber-600">
            Cadastre um perfil de acesso em Configuracoes &gt; Roles antes de criar usuarios.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hire_date">Data de admissao *</Label>
          <div className="relative">
            <Input
              id="hire_date"
              type="date"
              value={user.hire_date}
              onChange={(e) => onChange("hire_date", e.target.value)}
              required
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <Label htmlFor="termination_date">Data de demissao</Label>
          <div className="relative">
            <Input
              id="termination_date"
              type="date"
              value={user.termination_date}
              min={user.hire_date}
              onChange={(e) => onChange("termination_date", e.target.value)}
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFormFields;
