import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { WorkInfoSection } from "./form-sections/WorkInfoSection";
import { AddressSection } from "./form-sections/AddressSection";
import { ProjectsSection } from "./form-sections/ProjectsSection";
import { useEmployeeForm } from "./hooks/useEmployeeForm";

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
}

interface NewEmployeeFormProps {
  onSuccess: () => void;
  editingEmployee?: Employee | null;
}

const sectionSurface =
  "rounded-3xl border border-slate-200/70 bg-white/92 p-5 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-slate-900/70";

const headingStyle = "text-sm font-semibold text-slate-700 dark:text-slate-200";

const NewEmployeeForm = ({ onSuccess, editingEmployee }: NewEmployeeFormProps) => {
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
  } = useEmployeeForm({ onSuccess, editingEmployee });

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <div className="space-y-5">
        <div className={sectionSurface}>
          <h3 className={headingStyle}>Informações pessoais</h3>
          <div className="mt-4">
            <PersonalInfoSection formData={formData} handleInputChange={handleInputChange} />
          </div>
        </div>

        <div className={sectionSurface}>
          <h3 className={headingStyle}>Informações profissionais</h3>
          <div className="mt-4">
            <WorkInfoSection formData={formData} handleInputChange={handleInputChange} />
          </div>
        </div>

        <div className={sectionSurface}>
          <h3 className={headingStyle}>Endereço</h3>
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
            Observações
          </Label>
          <Textarea
            id="additional_notes"
            value={formData.additional_notes}
            onChange={(event) => handleInputChange("additional_notes", event.target.value)}
            placeholder="Se necessário"
            className="mt-3 h-24 resize-none rounded-2xl border border-slate-200/70 bg-white/90 text-sm text-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-[#7C6CFF]/40 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isLoading} size="sm">
          {isLoading ? "Salvando..." : editingEmployee ? "Salvar alterações" : "Cadastrar colaborador"}
        </Button>
      </div>
    </form>
  );
};

export default NewEmployeeForm;
