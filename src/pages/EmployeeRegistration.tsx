/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, Fragment } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  const fetchEmployees = useCallback(() => {
    try {
      const storedEmployees = JSON.parse(localStorage.getItem("tempEmployees") || "[]");
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

  const activeEmployees = employees.filter((employee) => employee.status === "active" && !employee.termination_date);
  const terminatedEmployees = employees.filter((employee) => employee.status === "inactive" || employee.termination_date);

  const renderEmployeeTable = (data: Employee[]) => {
    const clients = JSON.parse(localStorage.getItem("tempClients") || "[]");

    const getClientName = (clientId: string) => {
      const client = clients.find((client: any) => client.id === clientId);
      return client ? client.name : "";
    };

    const getProjectNames = (projectIds: string[]) => {
      const projectNames: string[] = [];

      for (const projectId of projectIds) {
        for (const client of clients) {
          const project = client.projects?.find((project: any) => project.id === projectId);
          if (project) {
            projectNames.push(project.name);
            break;
          }
        }
      }

      return projectNames.join(", ");
    };

    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/60">
            <TableRow className="border-b border-slate-200 dark:border-slate-800">
              <TableHead className="whitespace-nowrap text-slate-600 dark:text-slate-300">Nome/CPF</TableHead>
              <TableHead className="whitespace-nowrap text-slate-600 dark:text-slate-300">Contato</TableHead>
              <TableHead className="whitespace-nowrap text-slate-600 dark:text-slate-300">Cargo/Depto</TableHead>
              <TableHead className="whitespace-nowrap text-slate-600 dark:text-slate-300">Cliente</TableHead>
              <TableHead className="whitespace-nowrap text-slate-600 dark:text-slate-300">Projetos</TableHead>
              <TableHead className="whitespace-nowrap text-slate-600 dark:text-slate-300">Contrato/Horário</TableHead>
              <TableHead className="whitespace-nowrap text-slate-600 dark:text-slate-300">Endereço</TableHead>
              <TableHead className="whitespace-nowrap text-right text-slate-600 dark:text-slate-300">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum colaborador encontrado
                </TableCell>
              </TableRow>
            ) : (
              data.map((employee) => (
                <TableRow
                  key={employee.id}
                  className="border-b border-slate-200 transition hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-900/60"
                >
                  <TableCell className="align-top font-medium text-slate-900 dark:text-slate-100">
                    <div className="space-y-1">
                      <p>{employee.name}</p>
                      <p className="text-xs text-muted-foreground">CPF: {employee.cpf}</p>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      <p>{employee.email}</p>
                      <p>{employee.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      <p>{employee.position}</p>
                      <p>{employee.department}</p>
                    </div>
                  </TableCell>
                  <TableCell className="align-top text-sm text-slate-600 dark:text-slate-300">
                    {employee.selectedClients.map((clientId) => (
                      <Fragment key={clientId}>
                        {getClientName(clientId)}
                        <br />
                      </Fragment>
                    ))}
                  </TableCell>
                  <TableCell className="align-top text-sm text-slate-600 dark:text-slate-300">
                    {getProjectNames(employee.selectedProjects) || "?"}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      <p>{employee.contract_type}</p>
                      <p>{employee.work_shift}</p>
                      <p>Admiss?o: {employee.hire_date}</p>
                      {employee.termination_date && <p>Saída: {employee.termination_date}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="align-top max-w-[220px] text-sm text-slate-600 dark:text-slate-300">
                    {employee.address && (
                      <div className="space-y-1">
                        <p>
                          {employee.address.street}, {employee.address.number}
                          {employee.address.complement ? ` - ${employee.address.complement}` : ""}
                        </p>
                        <p>
                          {employee.address.neighborhood} - {employee.address.city}/{employee.address.state}
                        </p>
                        <p>CEP: {employee.address.zip_code}</p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="align-top text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(employee)}
                      className="h-8 w-8 text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
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

  const filteredActiveEmployees = activeEmployees.filter((employee) =>
    Object.values(employee).some((value) => String(value).toLowerCase().includes(searchQuery))
  );

  const filteredTerminatedEmployees = terminatedEmployees.filter((employee) =>
    Object.values(employee).some((value) => String(value).toLowerCase().includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Colaboradores</h1>
            <p className="text-sm text-muted-foreground dark:text-slate-400">
              Consulte, cadastre e mantenha os dados da sua equipe sempre atualizados.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail ou CPF"
                className="w-full border-slate-200 bg-white pl-9 dark:border-slate-700 dark:bg-slate-950/60"
                onChange={(event) => handleSearch(event.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Dialog
                open={showForm}
                onOpenChange={(open) => {
                  setShowForm(open);
                  if (!open) setEditingEmployee(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button className="rounded-full px-5">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo colaborador
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 p-0 dark:border-slate-800 dark:bg-slate-950/95">
                  <DialogHeader className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                    <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {editingEmployee ? "Editar colaborador" : "Novo colaborador"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="px-6 py-5">
                    <NewEmployeeForm
                      onSuccess={() => {
                        fetchEmployees();
                        setShowForm(false);
                        setEditingEmployee(null);
                        toast({
                          title: editingEmployee
                            ? "Colaborador atualizado com sucesso!"
                            : "Colaborador cadastrado com sucesso!",
                        });
                      }}
                      editingEmployee={editingEmployee}
                    />
                  </div>
                </DialogContent>
              </Dialog>
              <ShiftsDialog />
              <ReportDialog employees={employees} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="inactive">Inativos</TabsTrigger>
          </TabsList>
          <TabsContent value="active">{renderEmployeeTable(filteredActiveEmployees)}</TabsContent>
          <TabsContent value="inactive">{renderEmployeeTable(filteredTerminatedEmployees)}</TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default EmployeeRegistration;

