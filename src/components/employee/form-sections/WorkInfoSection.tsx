
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkInfoSectionProps {
  formData: {
    position: string;
    department: string;
    hire_date: string;
    contract_type: string;
    work_start_time: string;
    work_end_time: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export const WorkInfoSection = ({
  formData,
  handleInputChange,
}: WorkInfoSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="position">Cargo *</Label>
        <Input
          id="position"
          value={formData.position}
          onChange={(e) => handleInputChange('position', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Setor/Departamento *</Label>
        <Input
          id="department"
          value={formData.department}
          onChange={(e) => handleInputChange('department', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hire_date">Data de Admissão *</Label>
        <Input
          id="hire_date"
          type="date"
          value={formData.hire_date}
          onChange={(e) => handleInputChange('hire_date', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contract_type">Tipo de Contrato *</Label>
        <Select
          value={formData.contract_type}
          onValueChange={(value) => handleInputChange('contract_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de contrato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CLT">CLT</SelectItem>
            <SelectItem value="PJ">PJ</SelectItem>
            <SelectItem value="Estágio">Estágio</SelectItem>
            <SelectItem value="Temporário">Temporário</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="work_start_time">Horário de Entrada *</Label>
        <Input
          id="work_start_time"
          type="time"
          value={formData.work_start_time}
          onChange={(e) => handleInputChange('work_start_time', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="work_end_time">Horário de Saída *</Label>
        <Input
          id="work_end_time"
          type="time"
          value={formData.work_end_time}
          onChange={(e) => handleInputChange('work_end_time', e.target.value)}
          required
        />
      </div>
    </div>
  );
};
