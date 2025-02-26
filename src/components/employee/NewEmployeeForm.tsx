
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { WorkInfoSection } from "./form-sections/WorkInfoSection";
import { AddressSection } from "./form-sections/AddressSection";
import { ProjectsSection } from "./form-sections/ProjectsSection";
import { useEmployeeForm } from "./hooks/useEmployeeForm";

interface NewEmployeeFormProps {
  onSuccess: () => void;
}

const NewEmployeeForm = ({ onSuccess }: NewEmployeeFormProps) => {
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
    handleSubmit
  } = useEmployeeForm({ onSuccess });

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2">
      <div className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="text-sm font-semibold mb-3">Informações Pessoais</h3>
          <PersonalInfoSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="text-sm font-semibold mb-3">Informações Profissionais</h3>
          <WorkInfoSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <AddressSection 
            address={formData.address} 
            handleInputChange={handleInputChange} 
          />
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
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

        <div className="space-y-2">
          <Label htmlFor="additional_notes">Observações</Label>
          <Textarea
            id="additional_notes"
            value={formData.additional_notes}
            onChange={(e) => handleInputChange('additional_notes', e.target.value)}
            placeholder="Se necessário"
            className="h-20 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          size="sm"
        >
          {isLoading ? "Cadastrando..." : "Cadastrar Colaborador"}
        </Button>
      </div>
    </form>
  );
};

export default NewEmployeeForm;
