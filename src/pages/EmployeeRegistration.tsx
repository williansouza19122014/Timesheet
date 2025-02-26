
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
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
}

const EmployeeRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [managers, setManagers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Formatação do CPF (remover caracteres não numéricos)
      const cpf = formData.cpf.replace(/\D/g, '');

      const { data, error } = await supabase
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

      if (error) throw error;

      toast({
        title: "Colaborador cadastrado com sucesso!",
        description: formData.name,
      });

      navigate("/equipe");
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
    <div className="container mx-auto py-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Cadastro de Colaborador</h1>
      
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
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Cadastrando..." : "Cadastrar Colaborador"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeRegistration;
