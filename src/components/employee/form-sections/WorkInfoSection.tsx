
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkShiftSection } from "./WorkShiftSection";
import InputMask from "react-input-mask";

interface WorkInfoSectionProps {
  formData: {
    position: string;
    department: string;
    hire_date: string;
    termination_date?: string;
    contract_type: string;
    work_shift: string;
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
        <Label htmlFor="termination_date">Data de Demissão</Label>
        <Input
          id="termination_date"
          type="date"
          value={formData.termination_date}
          onChange={(e) => handleInputChange('termination_date', e.target.value)}
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

      <div className="space-y-2 md:col-span-2">
        <WorkShiftSection
          selectedShift={formData.work_shift}
          onShiftChange={(value) => handleInputChange('work_shift', value)}
        />
      </div>
    </div>
  );
};
