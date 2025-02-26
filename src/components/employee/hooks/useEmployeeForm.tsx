
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types/clients";

interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

interface Employee {
  id: string;
  name: string;
  cpf: string;
  birth_date: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hire_date: string;
  termination_date?: string;
  status: string;
  contract_type: string;
  work_shift: string;
  address: Address;
  selectedClients: string[];
  selectedProjects: string[];
  additional_notes?: string;
}

interface Props {
  onSuccess: () => void;
  editingEmployee?: Employee | null;
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
  termination_date?: string;
  contract_type: string;
  work_shift: string;
  address: Address;
  manager_id?: string;
  additional_notes?: string;
  selectedClients: string[];
  selectedProjects: string[];
}

export const useEmployeeForm = ({ onSuccess, editingEmployee }: Props) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: editingEmployee?.name || "",
    cpf: editingEmployee?.cpf || "",
    birth_date: editingEmployee?.birth_date || "",
    email: editingEmployee?.email || "",
    phone: editingEmployee?.phone || "",
    position: editingEmployee?.position || "",
    department: editingEmployee?.department || "",
    hire_date: editingEmployee?.hire_date || new Date().toISOString().split('T')[0],
    termination_date: editingEmployee?.termination_date || "",
    contract_type: editingEmployee?.contract_type || "",
    work_shift: editingEmployee?.work_shift || "",
    address: editingEmployee?.address || {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
    },
    additional_notes: editingEmployee?.additional_notes || "",
    selectedClients: editingEmployee?.selectedClients || [],
    selectedProjects: editingEmployee?.selectedProjects || []
  });

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

  const handleClientToggle = (clientId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedClients: prev.selectedClients.includes(clientId)
        ? prev.selectedClients.filter(id => id !== clientId)
        : [...prev.selectedClients, clientId]
    }));
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
      const employees = JSON.parse(localStorage.getItem('tempEmployees') || '[]');
      
      if (editingEmployee) {
        const updatedEmployees = employees.map((emp: Employee) => 
          emp.id === editingEmployee.id 
            ? { 
                ...emp, 
                ...formData,
                status: formData.termination_date ? 'inactive' : 'active'
              }
            : emp
        );
        localStorage.setItem('tempEmployees', JSON.stringify(updatedEmployees));
      } else {
        const newEmployee = {
          id: crypto.randomUUID(),
          ...formData,
          status: formData.termination_date ? 'inactive' : 'active',
          created_at: new Date().toISOString(),
        };
        
        employees.push(newEmployee);
        localStorage.setItem('tempEmployees', JSON.stringify(employees));

        if (formData.selectedProjects.length > 0) {
          const projectMembers = JSON.parse(localStorage.getItem('tempProjectMembers') || '[]');
          const newProjectMembers = formData.selectedProjects.map(projectId => ({
            id: crypto.randomUUID(),
            user_id: newEmployee.id,
            project_id: projectId,
            start_date: formData.hire_date,
            role: formData.position
          }));
          
          projectMembers.push(...newProjectMembers);
          localStorage.setItem('tempProjectMembers', JSON.stringify(projectMembers));
        }

        if (formData.selectedClients.length > 0) {
          const clientEmployees = JSON.parse(localStorage.getItem('tempClientEmployees') || '[]');
          const newClientEmployees = formData.selectedClients.map(clientId => ({
            id: crypto.randomUUID(),
            employee_id: newEmployee.id,
            client_id: clientId,
            start_date: formData.hire_date
          }));
          
          clientEmployees.push(...newClientEmployees);
          localStorage.setItem('tempClientEmployees', JSON.stringify(clientEmployees));
        }
      }

      toast({
        title: editingEmployee 
          ? "Colaborador atualizado com sucesso!" 
          : "Colaborador cadastrado com sucesso!",
        description: `${formData.name} foi ${editingEmployee ? 'atualizado' : 'adicionado'} à equipe.`
      });
      
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

  return {
    formData,
    isLoading,
    clients,
    selectedClient,
    setSelectedClient,
    setClients,
    handleInputChange,
    handleClientToggle,
    handleProjectToggle,
    handleSubmit
  };
};
