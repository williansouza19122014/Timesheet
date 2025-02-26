
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { WorkInfoSection } from "./form-sections/WorkInfoSection";
import { AddressSection } from "./form-sections/AddressSection";
import { ProjectsSection } from "./form-sections/ProjectsSection";

interface NewEmployeeFormProps {
  onSuccess: () => void;
}

interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

interface Client {
  id: string;
  name: string;
  projects: Project[];
}

interface Project {
  id: string;
  name: string;
}

interface EmployeeFormData {
  name: string;
  cpf: string;
  birth_date: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hire_date: string;
  contract_type: string;
  work_start_time: string;
  work_end_time: string;
  address: Address;
  manager_id?: string;
  additional_notes?: string;
  selectedProjects: string[];
}

const NewEmployeeForm = ({ onSuccess }: NewEmployeeFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: "",
    cpf: "",
    birth_date: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    hire_date: new Date().toISOString().split('T')[0],
    contract_type: "",
    work_start_time: "",
    work_end_time: "",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
    },
    additional_notes: "",
    selectedProjects: []
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          projects (
            id,
            name
          )
        `);

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar clientes",
        description: error.message
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'address') {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleProjectToggle = (projectId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedProjects: prev.selectedProjects.includes(projectId)
        ? prev.selectedProjects.filter(id => id !== projectId)
        : [...prev.selectedProjects, projectId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cpf = formData.cpf.replace(/\D/g, '');

      const { data: employeeData, error: employeeError } = await supabase
        .from('system_users')
        .insert({
          name: formData.name,
          email: formData.email,
          cpf,
          birth_date: formData.birth_date,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
          hire_date: formData.hire_date,
          contract_type: formData.contract_type,
          work_start_time: formData.work_start_time,
          work_end_time: formData.work_end_time,
          address: formData.address,
          manager_id: formData.manager_id,
          additional_notes: formData.additional_notes,
          status: 'active'
        })
        .select()
        .single();

      if (employeeError) throw employeeError;

      if (formData.selectedProjects.length > 0) {
        const projectMembers = formData.selectedProjects.map(projectId => ({
          user_id: employeeData.id,
          project_id: projectId,
          start_date: new Date().toISOString().split('T')[0],
          role: formData.position
        }));

        const { error: projectMemberError } = await supabase
          .from('project_members')
          .insert(projectMembers);

        if (projectMemberError) throw projectMemberError;
      }

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao cadastrar colaborador:', error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar colaborador",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <PersonalInfoSection 
          formData={formData} 
          handleInputChange={handleInputChange} 
        />

        <WorkInfoSection 
          formData={formData} 
          handleInputChange={handleInputChange} 
        />

        <AddressSection 
          address={formData.address} 
          handleInputChange={handleInputChange} 
        />

        <ProjectsSection 
          clients={clients}
          selectedClient={selectedClient}
          selectedProjects={formData.selectedProjects}
          setSelectedClient={setSelectedClient}
          handleProjectToggle={handleProjectToggle}
        />

        <div className="space-y-2">
          <Label htmlFor="additional_notes">Observações Adicionais</Label>
          <Textarea
            id="additional_notes"
            value={formData.additional_notes}
            onChange={(e) => handleInputChange('additional_notes', e.target.value)}
            placeholder="Se necessário"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Cadastrando..." : "Cadastrar Colaborador"}
        </Button>
      </div>
    </form>
  );
};

export default NewEmployeeForm;
