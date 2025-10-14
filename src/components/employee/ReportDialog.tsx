import { useState, useEffect } from "react";
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
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("all");

  const availableFields = [
    { id: "name", label: "Nome" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Telefone" },
    { id: "position", label: "Cargo" },
    { id: "department", label: "Departamento" },
    { id: "hire_date", label: "Data de admissao" },
    { id: "status", label: "Status" },
    { id: "cpf", label: "CPF" },
    { id: "birth_date", label: "Data de nascimento" },
    { id: "contract_type", label: "Tipo de contrato" },
    { id: "work_start_time", label: "Horario de entrada" },
    { id: "work_end_time", label: "Horario de saida" },
    { id: "selectedClients", label: "Cliente" },
    { id: "selectedProjects", label: "Projeto" },
  ];

  useEffect(() => {
    if (!isOpen) {
      setSelectedFields([]);
      setStatusFilter("all");
    }
  }, [isOpen]);

  const handleSelectAll = () => {
    if (selectedFields.length === availableFields.length) {
      setSelectedFields([]);
      return;
    }
    setSelectedFields(availableFields.map((field) => field.id));
  };

  const generateReport = () => {
    if (selectedFields.length === 0) {
      return;
    }

    const filteredEmployees = employees.filter((employee) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return employee.status === "active";
      return employee.status === "inactive";
    });

    const headers = selectedFields.map((field) => {
      const fieldInfo = availableFields.find((item) => item.id === field);
      return fieldInfo?.label ?? field;
    });

    const rows = filteredEmployees.map((employee) =>
      selectedFields.map((field) => {
        if (field === "selectedClients") {
          const clients = JSON.parse(localStorage.getItem("tempClients") || "[]");
          return employee.selectedClients
            .map((clientId) => clients.find((client: any) => client.id === clientId)?.name || "")
            .filter(Boolean)
            .join(", ");
        }
        if (field === "selectedProjects") {
          const clients = JSON.parse(localStorage.getItem("tempClients") || "[]");
          return employee.selectedProjects
            .map((projectId) => {
              for (const client of clients) {
                const project = client.projects?.find((project: any) => project.id === projectId);
                if (project) return project.name;
              }
              return "";
            })
            .filter(Boolean)
            .join(", ");
        }
        if (field in employee) {
          const value = employee[field as keyof Employee];
          if (field === "hire_date" || field === "birth_date") {
            return value ? new Date(value as string).toLocaleDateString() : "";
          }
          return value ?? "";
        }
        return "";
      })
    );

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `relatorio_colaboradores_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-slate-200 bg-white text-slate-700 hover:border-[#7355F6] hover:bg-[#7355F6]/10 hover:text-[#5533d6] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#8b5cf6] dark:hover:bg-[#8b5cf6]/15 dark:hover:text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          Gerar relatorio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-2xl border border-slate-200 bg-white/95 text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-100">
        <DialogHeader className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <DialogTitle className="text-lg font-semibold">Relatorio de colaboradores</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 px-6 py-5">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <Label className="mb-2 block text-sm font-medium">Filtrar por status</Label>
            <RadioGroup
              value={statusFilter}
              onValueChange={(value: "active" | "inactive" | "all") => setStatusFilter(value)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="status-all" />
                <Label htmlFor="status-all">Todos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="status-active" />
                <Label htmlFor="status-active">Ativos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="status-inactive" />
                <Label htmlFor="status-inactive">Inativos</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2 border-b border-slate-200 pb-4 dark:border-slate-800">
            <Checkbox
              id="select-all-fields"
              checked={selectedFields.length === availableFields.length}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all-fields" className="text-sm font-medium">
              Selecionar todos
            </Label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {availableFields.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={field.id}
                  checked={selectedFields.includes(field.id)}
                  onCheckedChange={(checked) => {
                    setSelectedFields((previous) =>
                      checked
                        ? [...previous, field.id]
                        : previous.filter((id) => id !== field.id)
                    );
                  }}
                />
                <Label htmlFor={field.id}>{field.label}</Label>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end px-6 pb-6">
          <Button
            onClick={generateReport}
            disabled={selectedFields.length === 0}
            className="bg-gradient-to-r from-[#7355F6] to-[#A26CFF] text-white shadow-[0_10px_24px_-18px_rgba(115,85,246,0.75)] hover:from-[#6245f2] hover:to-[#935cff] disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
          >
            Gerar relatorio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
