import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { WorkInfoSection } from "./form-sections/WorkInfoSection";
import { AddressSection } from "./form-sections/AddressSection";
import { ProjectsSection } from "./form-sections/ProjectsSection";
import { useEmployeeForm } from "./hooks/useEmployeeForm";
import { useAccessControl } from "@/context/access-control-context";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hire_date: string;
  termination_date?: string;
  status: string;
  cpf: string;
  birth_date: string;
  contract_type: string;
  work_shift: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  selectedClients: string[];
  selectedProjects: string[];
  accessRole?: string;
}

interface NewEmployeeFormProps {
  onSuccess: () => void;
  editingEmployee?: Employee | null;
}

const sectionSurface =
  "rounded-3xl border border-slate-200/70 bg-white/92 p-5 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-slate-900/70";

const headingStyle = "text-sm font-semibold text-slate-700 dark:text-slate-200";

const NewEmployeeForm = ({ onSuccess, editingEmployee }: NewEmployeeFormProps) => {
  const { roleDefinitions } = useAccessControl();
  const preferredDefaultRole =
    roleDefinitions.find((role) => role.id === "user") ??
    roleDefinitions[0] ??
    null;

  const resolvedDefaultRole =
    editingEmployee?.accessRole ??
    preferredDefaultRole?.id ??
    "";

  const {
    formData,
    isLoading,
    clients,
    selectedClient,
    setSelectedClient,
    setClients,
    handleInputChange,
    handleProjectToggle,
    handleClientToggle,
    handleSubmit,
  } = useEmployeeForm({
    onSuccess,
    editingEmployee,
    defaultAccessRole: resolvedDefaultRole,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <div className="space-y-5">
        <div className={sectionSurface}>
          <h3 className={headingStyle}>Informacoes pessoais</h3>
          <div className="mt-4">
            <PersonalInfoSection formData={formData} handleInputChange={handleInputChange} />
          </div>
        </div>

        <div className={sectionSurface}>
          <h3 className={headingStyle}>Informacoes profissionais</h3>
          <div className="mt-4">
            <WorkInfoSection formData={formData} handleInputChange={handleInputChange} />
          </div>
        </div>

        <div className={sectionSurface}>
          <h3 className={headingStyle}>Perfil de acesso</h3>
          <div className="mt-4 space-y-3">
            <Label htmlFor="accessRole" className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Defina o perfil de acesso do colaborador *
            </Label>
            <Select
              value={formData.accessRole}
              onValueChange={(value) => handleInputChange("accessRole", value)}
              disabled={roleDefinitions.length === 0}
            >
              <SelectTrigger
                id="accessRole"
                className="w-full rounded-2xl border border-slate-200/70 bg-white/90 text-sm text-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-[#7C6CFF]/40 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
              >
                <SelectValue placeholder="Selecione um perfil" />
              </SelectTrigger>
              <SelectContent>
                {roleDefinitions.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Este perfil determina as funcionalidades disponiveis para o colaborador.
            </p>
          </div>
        </div>

        <div className={sectionSurface}>
          <h3 className={headingStyle}>Endereco</h3>
          <div className="mt-4">
            <AddressSection address={formData.address} handleInputChange={handleInputChange} />
          </div>
        </div>

        <div className={sectionSurface}>
          <h3 className={headingStyle}>Projetos e clientes</h3>
          <div className="mt-4">
            <ProjectsSection
              clients={clients}
              selectedClient={selectedClient}
              selectedProjects={formData.selectedProjects}
              setSelectedClient={setSelectedClient}
              handleProjectToggle={handleProjectToggle}
              handleClientToggle={handleClientToggle}
              setClients={setClients}
              selectedClients={formData.selectedClients}
            />
          </div>
        </div>

        <div className={sectionSurface}>
          <Label htmlFor="additional_notes" className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Observacoes
          </Label>
          <Textarea
            id="additional_notes"
            value={formData.additional_notes}
            onChange={(event) => handleInputChange("additional_notes", event.target.value)}
            placeholder="Se necessario"
            className="mt-3 h-24 resize-none rounded-2xl border border-slate-200/70 bg-white/90 text-sm text-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-[#7C6CFF]/40 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isLoading || !formData.accessRole} size="sm">
          {isLoading ? "Salvando..." : editingEmployee ? "Salvar alteracoes" : "Cadastrar colaborador"}
        </Button>
      </div>
    </form>
  );
};

export default NewEmployeeForm;
