
import { useState } from "react";
import { Download } from "lucide-react";
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
}

interface ReportDialogProps {
  employees: Employee[];
}

export function ReportDialog({ employees }: ReportDialogProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

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
    { id: "work_end_time", label: "Horário de Saída" }
  ];

  const generateReport = () => {
    if (selectedFields.length === 0) return;

    // Criar cabeçalho do CSV
    const headers = selectedFields.map(field => {
      const fieldInfo = availableFields.find(f => f.id === field);
      return fieldInfo?.label || field;
    });

    // Criar linhas de dados
    const rows = employees.map(employee => {
      return selectedFields.map(field => {
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

    // Combinar cabeçalho e linhas
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Criar e baixar arquivo
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Gerar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Relatório de Colaboradores</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
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
