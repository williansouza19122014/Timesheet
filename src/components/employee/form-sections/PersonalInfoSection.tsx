
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PersonalInfoSectionProps {
  formData: {
    name: string;
    cpf: string;
    birth_date: string;
    email: string;
    phone: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export const PersonalInfoSection = ({
  formData,
  handleInputChange,
}: PersonalInfoSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf">CPF *</Label>
        <Input
          id="cpf"
          value={formData.cpf}
          onChange={(e) => handleInputChange('cpf', e.target.value)}
          placeholder="Apenas números"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birth_date">Data de Nascimento *</Label>
        <Input
          id="birth_date"
          type="date"
          value={formData.birth_date}
          onChange={(e) => handleInputChange('birth_date', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail Corporativo *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone *</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="Com DDD"
          required
        />
      </div>
    </div>
  );
};
