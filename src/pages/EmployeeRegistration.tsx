/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewEmployeeForm from "@/components/employee/NewEmployeeForm";
import { ReportDialog } from "@/components/employee/ReportDialog";
import { ShiftsDialog } from "@/components/employee/ShiftsDialog";

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

const EmployeeRegistration = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  const { toast } = useToast();
  const [showReportDialog, setShowReportDialog] = useState(false);

 const fetchEmployees = useCallback(() => {
    try {
      const storedEmployees = JSON.parse(
        localStorage.getItem("tempEmployees") || "[]"
      );
      const sortedEmployees = storedEmployees.sort((a: Employee, b: Employee) =>
        a.name.localeCompare(b.name)
      );
      setEmployees(sortedEmployees);
    } catch (error: unknown) {
      console.error("Erro ao carregar colaboradores:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar colaboradores",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearch = (value: string) => {
    setSearchQuery(value.toLowerCase());
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const activeEmployees = employees.filter(e => e.status === 'active' && !e.termination_date);
  const terminatedEmployees = employees.filter(e => e.status === 'inactive' || e.termination_date);

  const renderEmployeeTable = (employees: Employee[]) => {
    const clients = JSON.parse(localStorage.getItem('tempClients') || '[]');
    
    const getClientName = (clientId: string) => {
      const client = clients.find((c: any) => c.id === clientId);
      return client ? client.name : '';
    };

    const getProjectNames = (projectIds: string[]) => {
      const projectNames: string[] = [];
      for (const projectId of projectIds) {
        for (const client of clients) {
          const project = client.projects?.find((p: any) => p.id === projectId);
          if (project) {
            projectNames.push(project.name);
            break;
          }
        }
      }
      return projectNames.join(', ');
    };

    return (
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Nome/CPF</TableHead>
              <TableHead className="whitespace-nowrap">Contato</TableHead>
              <TableHead className="whitespace-nowrap">Cargo/Depto</TableHead>
              <TableHead className="whitespace-nowrap">Cliente</TableHead>
              <TableHead className="whitespace-nowrap">Projetos</TableHead>
              <TableHead className="whitespace-nowrap">Contrato/Horário</TableHead>
              <TableHead className="whitespace-nowrap">Endereço</TableHead>
              <TableHead className="whitespace-nowrap w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  Nenhum colaborador encontrado
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
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
                    {employee.selectedClients.map(clientId => getClientName(clientId)).join(', ') || 'Nenhum cliente'}
                  </TableCell>
                  <TableCell>
                    {getProjectNames(employee.selectedProjects) || 'Nenhum projeto'}
                  </TableCell>
                  <TableCell>
                    <div>{employee.contract_type}</div>
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(employee)}
                      className="h-8 w-8 p-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Colaboradores</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar colaboradores..."
              className="pl-9 w-[300px]"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
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
                  {editingEmployee ? 'Editar Colaborador' : 'Novo Colaborador'}
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

          <ShiftsDialog />
          <ReportDialog employees={employees} />
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="inactive">Inativos</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {renderEmployeeTable(filteredActiveEmployees)}
        </TabsContent>
        <TabsContent value="inactive">
          {renderEmployeeTable(filteredTerminatedEmployees)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeRegistration;
