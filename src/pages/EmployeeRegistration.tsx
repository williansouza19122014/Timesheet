
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Download, Filter, Plus } from "lucide-react";
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
}

const EmployeeRegistration = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Partial<Record<keyof Employee, string>>>({});
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('system_users')
        .select('*')
        .order('name');

      if (error) throw error;

      setEmployees(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar colaboradores:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar colaboradores",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value.toLowerCase());
  };

  const handleFilter = (column: keyof Employee, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value.toLowerCase()
    }));
  };

  const filteredEmployees = employees.filter(employee => {
    // Aplicar busca global
    if (searchQuery && !Object.values(employee).some(value => 
      String(value).toLowerCase().includes(searchQuery)
    )) {
      return false;
    }

    // Aplicar filtros por coluna
    return Object.entries(filters).every(([column, filterValue]) => {
      if (!filterValue) return true;
      const cellValue = String(employee[column as keyof Employee]).toLowerCase();
      return cellValue.includes(filterValue);
    });
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Colaboradores</h1>
        <div className="flex gap-4">
          <ReportDialog employees={employees} />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Colaborador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Colaborador</DialogTitle>
              </DialogHeader>
              <NewEmployeeForm onSuccess={() => {
                fetchEmployees();
                toast({
                  title: "Colaborador cadastrado com sucesso!"
                });
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar colaboradores..."
              className="pl-10"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Nome
                    <Input
                      placeholder="Filtrar"
                      className="w-24 h-8"
                      onChange={(e) => handleFilter('name', e.target.value)}
                    />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Email
                    <Input
                      placeholder="Filtrar"
                      className="w-24 h-8"
                      onChange={(e) => handleFilter('email', e.target.value)}
                    />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Cargo
                    <Input
                      placeholder="Filtrar"
                      className="w-24 h-8"
                      onChange={(e) => handleFilter('position', e.target.value)}
                    />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Departamento
                    <Input
                      placeholder="Filtrar"
                      className="w-24 h-8"
                      onChange={(e) => handleFilter('department', e.target.value)}
                    />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Data Admissão
                    <Input
                      placeholder="Filtrar"
                      className="w-24 h-8"
                      onChange={(e) => handleFilter('hire_date', e.target.value)}
                    />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{new Date(employee.hire_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      employee.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRegistration;
