
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Pencil } from "lucide-react";
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
  termination_date?: string;
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
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
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

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const activeEmployees = employees.filter(e => e.status === 'active' && !e.termination_date);
  const terminatedEmployees = employees.filter(e => e.status === 'inactive' || e.termination_date);

  const renderEmployeeTable = (employees: Employee[], title: string) => (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Nome/CPF</TableHead>
              <TableHead className="whitespace-nowrap">Contato</TableHead>
              <TableHead className="whitespace-nowrap">Cargo/Depto</TableHead>
              <TableHead className="whitespace-nowrap">Contrato/Horário</TableHead>
              <TableHead className="whitespace-nowrap">Endereço</TableHead>
              <TableHead className="whitespace-nowrap">Projetos</TableHead>
              <TableHead className="whitespace-nowrap w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id} className="text-xs">
                <TableCell>
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-muted-foreground">
                    CPF: {employee.cpf}<br />
                    Nasc: {new Date(employee.birth_date).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div>{employee.email}</div>
                  <div className="text-muted-foreground">{employee.phone}</div>
                </TableCell>
                <TableCell>
                  <div>{employee.position}</div>
                  <div className="text-muted-foreground">{employee.department}</div>
                </TableCell>
                <TableCell>
                  <div>{employee.contract_type}</div>
                  <div className="text-muted-foreground">
                    {employee.work_start_time} - {employee.work_end_time}
                  </div>
                  <div className="text-muted-foreground">
                    Admissão: {new Date(employee.hire_date).toLocaleDateString()}
                    {employee.termination_date && (
                      <><br />Demissão: {new Date(employee.termination_date).toLocaleDateString()}</>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  {employee.address && (
                    <div>
                      {employee.address.street}, {employee.address.number}
                      <br />
                      {employee.address.neighborhood} - {employee.address.city}/{employee.address.state}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {employee.selectedProjects?.length > 0 
                    ? employee.selectedProjects.length + " projetos vinculados"
                    : "Nenhum projeto"}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(employee)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  Nenhum colaborador encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const filteredActiveEmployees = activeEmployees.filter(employee =>
    Object.values(employee).some(value => 
      String(value).toLowerCase().includes(searchQuery)
    )
  );

  const filteredTerminatedEmployees = terminatedEmployees.filter(employee =>
    Object.values(employee).some(value => 
      String(value).toLowerCase().includes(searchQuery)
    )
  );

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-6">Colaboradores</h1>
      
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar colaboradores..."
            className="pl-9"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <ReportDialog employees={employees} />
          
          <Dialog open={showForm} onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setEditingEmployee(null);
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Novo Colaborador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? 'Editar Colaborador' : 'Cadastrar Novo Colaborador'}
                </DialogTitle>
              </DialogHeader>
              <NewEmployeeForm 
                onSuccess={() => {
                  fetchEmployees();
                  setShowForm(false);
                  setEditingEmployee(null);
                  toast({
                    title: editingEmployee 
                      ? "Colaborador atualizado com sucesso!"
                      : "Colaborador cadastrado com sucesso!"
                  });
                }}
                editingEmployee={editingEmployee}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        {renderEmployeeTable(filteredActiveEmployees, "Colaboradores Ativos")}
        {renderEmployeeTable(filteredTerminatedEmployees, "Colaboradores Desligados")}
      </div>
    </div>
  );
};

export default EmployeeRegistration;
