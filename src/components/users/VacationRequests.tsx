import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  ensureVacationData,
  createDefaultVacationEntry,
} from "@/utils/vacation-storage";
import { VacationRequest } from "@/types/vacations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface VacationRequestsProps {
  userId: string;
}

const statusStyles: Record<
  VacationRequest["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Pendente",
    className:
      "border-transparent bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-200",
  },
  approved: {
    label: "Aprovado",
    className:
      "border-transparent bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  denied: {
    label: "Negado",
    className:
      "border-transparent bg-rose-500/15 text-rose-600 dark:bg-rose-400/15 dark:text-rose-200",
  },
  cancelled: {
    label: "Cancelado",
    className:
      "border-transparent bg-slate-500/15 text-slate-600 dark:bg-slate-400/15 dark:text-slate-200",
  },
};

const VacationRequests = ({ userId }: VacationRequestsProps) => {
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadVacationRequests = useCallback(() => {
    if (!userId) {
      setRequests([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const entry = ensureVacationData(userId, () => createDefaultVacationEntry(userId));
      const sorted = [...entry.requests].sort((a, b) => {
        const aKey = a.created_at ?? a.start_date;
        const bKey = b.created_at ?? b.start_date;
        return bKey.localeCompare(aKey);
      });
      setRequests(sorted);
    } catch (error) {
      console.error("Erro ao carregar solicitações de férias:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar solicitações",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, userId]);

  useEffect(() => {
    loadVacationRequests();
  }, [loadVacationRequests]);

  if (isLoading) {
    return <div>Carregando solicitações...</div>;
  }

  if (!requests.length) {
    return <div className="text-sm text-slate-500">Nenhuma solicitação registrada.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data da Solicitação</TableHead>
          <TableHead>Início</TableHead>
          <TableHead>Fim</TableHead>
          <TableHead className="text-center">Dias</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>
              {format(new Date(request.created_at ?? request.start_date), "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </TableCell>
            <TableCell>
              {format(new Date(request.start_date), "dd/MM/yyyy", { locale: ptBR })}
            </TableCell>
            <TableCell>
              {format(new Date(request.end_date), "dd/MM/yyyy", { locale: ptBR })}
            </TableCell>
            <TableCell className="text-center">{request.days_taken}</TableCell>
            <TableCell className="text-right">
              <Badge variant="outline" className={statusStyles[request.status].className}>
                {statusStyles[request.status].label}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default VacationRequests;
