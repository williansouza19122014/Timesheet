/* eslint-disable @typescript-eslint/no-explicit-any */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InputMask from "react-input-mask";

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
        <InputMask
          mask="999.999.999-99"
          value={formData.cpf}
          onChange={(e) => handleInputChange('cpf', e.target.value)}
        >
          {(inputProps: any) => (
            <Input
              {...inputProps}
              id="cpf"
              placeholder="000.000.000-00"
              required
            />
          )}
        </InputMask>
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
        <InputMask
          mask="(99) 99999-9999"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
        >
          {(inputProps: any) => (
            <Input
              {...inputProps}
              id="phone"
              placeholder="(00) 00000-0000"
              required
            />
          )}
        </InputMask>
      </div>
    </div>
  );
};
