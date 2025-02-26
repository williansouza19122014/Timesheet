
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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

      // 1. Inserir o colaborador
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

      // 2. Inserir as associações com projetos
      if (formData.selectedProjects.length > 0) {
        const projectMembers = formData.selectedProjects.map(projectId => ({
          user_id: employeeData.id,
          project_id: projectId,
          start_date: new Date().toISOString().split('T')[0],
          role: formData.position // Usando o cargo como role inicial
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

  const currentClientProjects = selectedClient
    ? clients.find(c => c.id === selectedClient)?.projects || []
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="street">Rua *</Label>
            <Input
              id="street"
              value={formData.address.street}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Número *</Label>
            <Input
              id="number"
              value={formData.address.number}
              onChange={(e) => handleInputChange('address.number', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              value={formData.address.complement}
              onChange={(e) => handleInputChange('address.complement', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro *</Label>
            <Input
              id="neighborhood"
              value={formData.address.neighborhood}
              onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              value={formData.address.city}
              onChange={(e) => handleInputChange('address.city', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado *</Label>
            <Input
              id="state"
              value={formData.address.state}
              onChange={(e) => handleInputChange('address.state', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">CEP *</Label>
            <Input
              id="zip_code"
              value={formData.address.zip_code}
              onChange={(e) => handleInputChange('address.zip_code', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Projetos</h3>
        <div className="space-y-2">
          <Label>Selecione o Cliente</Label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedClient && (
          <div className="space-y-2">
            <Label>Projetos do Cliente</Label>
            <div className="grid grid-cols-2 gap-4">
              {currentClientProjects.map(project => (
                <div key={project.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`project-${project.id}`}
                    checked={formData.selectedProjects.includes(project.id)}
                    onCheckedChange={() => handleProjectToggle(project.id)}
                  />
                  <Label htmlFor={`project-${project.id}`}>{project.name}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional_notes">Observações Adicionais</Label>
        <Textarea
          id="additional_notes"
          value={formData.additional_notes}
          onChange={(e) => handleInputChange('additional_notes', e.target.value)}
          placeholder="Se necessário"
        />
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
