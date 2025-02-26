
import { useState, useEffect } from "react";
import { Download, CheckSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hire_date: string;
  status: string;
  cpf?: string;
  birth_date?: string;
  contract_type?: string;
  work_start_time?: string;
  work_end_time?: string;
  address?: {
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

interface ReportDialogProps {
  employees: Employee[];
}

export function ReportDialog({ employees }: ReportDialogProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');

  const availableFields = [
    { id: "name", label: "Nome" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Telefone" },
    { id: "position", label: "Cargo" },
    { id: "department", label: "Departamento" },
    { id: "hire_date", label: "Data de Admissão" },
    { id: "status", label: "Status" },
    { id: "cpf", label: "CPF" },
    { id: "birth_date", label: "Data de Nascimento" },
    { id: "contract_type", label: "Tipo de Contrato" },
    { id: "work_start_time", label: "Horário de Entrada" },
    { id: "work_end_time", label: "Horário de Saída" },
    { id: "selectedClients", label: "Cliente" },
    { id: "selectedProjects", label: "Projeto" }
  ];

  useEffect(() => {
    if (!isOpen) {
      setSelectedFields([]);
      setStatusFilter('all');
    }
  }, [isOpen]);

  const handleSelectAll = () => {
    if (selectedFields.length === availableFields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(availableFields.map(field => field.id));
    }
  };

  const generateReport = () => {
    if (selectedFields.length === 0) return;

    const filteredEmployees = employees.filter(employee => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return employee.status === 'active';
      return employee.status === 'inactive';
    });

    const headers = selectedFields.map(field => {
      const fieldInfo = availableFields.find(f => f.id === field);
      return fieldInfo?.label || field;
    });

    const rows = filteredEmployees.map(employee => {
      return selectedFields.map(field => {
        if (field === 'selectedClients') {
          const clients = JSON.parse(localStorage.getItem('tempClients') || '[]');
          const clientNames = employee.selectedClients
            .map(clientId => clients.find((c: any) => c.id === clientId)?.name || '')
            .filter(Boolean)
            .join(', ');
          return clientNames;
        }
        if (field === 'selectedProjects') {
          const clients = JSON.parse(localStorage.getItem('tempClients') || '[]');
          const projectNames = employee.selectedProjects
            .map(projectId => {
              for (const client of clients) {
                const project = client.projects?.find((p: any) => p.id === projectId);
                if (project) return project.name;
              }
              return '';
            })
            .filter(Boolean)
            .join(', ');
          return projectNames;
        }
        if (field in employee) {
          const value = employee[field as keyof Employee];
          if (field === 'hire_date' || field === 'birth_date') {
            return value ? new Date(value as string).toLocaleDateString() : '';
          }
          return value || '';
        }
        return '';
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_colaboradores_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Gerar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Relatório de Colaboradores</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-6">
            <Label className="mb-2 block font-medium">Filtrar por Status</Label>
            <RadioGroup
              value={statusFilter}
              onValueChange={(value: 'active' | 'inactive' | 'all') => setStatusFilter(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">Todos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active">Ativos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="inactive" />
                <Label htmlFor="inactive">Inativos</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2 mb-4 border-b pb-4">
            <Checkbox
              id="select-all"
              checked={selectedFields.length === availableFields.length}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="font-medium">Selecionar Todos</Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {availableFields.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={field.id}
                  checked={selectedFields.includes(field.id)}
                  onCheckedChange={(checked) => {
                    setSelectedFields(prev =>
                      checked
                        ? [...prev, field.id]
                        : prev.filter(id => id !== field.id)
                    );
                  }}
                />
                <Label htmlFor={field.id}>{field.label}</Label>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={generateReport}
            disabled={selectedFields.length === 0}
          >
            Gerar Relatório
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
