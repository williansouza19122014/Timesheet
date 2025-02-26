
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import NewEmployeeForm from "@/components/employee/NewEmployeeForm";
import { ReportDialog } from "@/components/employee/ReportDialog";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hire_date: string;
  status: string;
  cpf: string;
  birth_date: string;
  contract_type: string;
  work_start_time: string;
  work_end_time: string;
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

const EmployeeRegistration = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const fetchEmployees = () => {
    try {
      const storedEmployees = JSON.parse(localStorage.getItem('tempEmployees') || '[]');
      // Ordenar por nome em ordem alfabética
      const sortedEmployees = storedEmployees.sort((a: Employee, b: Employee) => 
        a.name.localeCompare(b.name)
      );
      setEmployees(sortedEmployees);
    } catch (error: any) {
      console.error('Erro ao carregar colaboradores:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar colaboradores",
        description: error.message
      });
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value.toLowerCase());
  };

  const filteredEmployees = employees.filter(employee => {
    return Object.values(employee).some(value => 
      String(value).toLowerCase().includes(searchQuery)
    );
  });

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-end mb-4">
        <div className="flex gap-2">
          <ReportDialog employees={employees} />
          
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Novo Colaborador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Colaborador</DialogTitle>
              </DialogHeader>
              <NewEmployeeForm 
                onSuccess={() => {
                  fetchEmployees();
                  setShowForm(false);
                  toast({
                    title: "Colaborador cadastrado com sucesso!"
                  });
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar colaboradores..."
              className="pl-9"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Nome</TableHead>
                <TableHead className="whitespace-nowrap">CPF</TableHead>
                <TableHead className="whitespace-nowrap">Contato</TableHead>
                <TableHead className="whitespace-nowrap">Cargo/Depto</TableHead>
                <TableHead className="whitespace-nowrap">Contrato</TableHead>
                <TableHead className="whitespace-nowrap">Horário</TableHead>
                <TableHead className="whitespace-nowrap">Endereço</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Projetos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="text-sm">
                  <TableCell className="font-medium">
                    {employee.name}
                    <div className="text-xs text-muted-foreground">
                      Nasc: {new Date(employee.birth_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{employee.cpf}</TableCell>
                  <TableCell>
                    <div>{employee.email}</div>
                    <div className="text-xs text-muted-foreground">{employee.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div>{employee.position}</div>
                    <div className="text-xs text-muted-foreground">{employee.department}</div>
                  </TableCell>
                  <TableCell>
                    <div>{employee.contract_type}</div>
                    <div className="text-xs text-muted-foreground">
                      Admissão: {new Date(employee.hire_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {employee.work_start_time} - {employee.work_end_time}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {employee.address && (
                      <div className="text-xs">
                        {employee.address.street}, {employee.address.number} - {employee.address.neighborhood}
                        <br />
                        {employee.address.city}/{employee.address.state}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      employee.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {employee.selectedProjects?.length > 0 
                      ? employee.selectedProjects.length + " projetos vinculados"
                      : "Nenhum projeto"}
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                    Nenhum colaborador encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRegistration;
