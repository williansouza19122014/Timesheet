
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface VacationRequest {
  id: string;
  start_date: string;
  end_date: string;
  days_taken: number;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  created_at: string;
}

interface VacationRequestsProps {
  userId: string;
}

const statusMap = {
  pending: { label: 'Pendente', variant: 'default' },
  approved: { label: 'Aprovado', variant: 'success' },
  denied: { label: 'Negado', variant: 'destructive' },
  cancelled: { label: 'Cancelado', variant: 'secondary' },
} as const;

const VacationRequests = ({ userId }: VacationRequestsProps) => {
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadVacationRequests();
  }, []);

  const loadVacationRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('vacation_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar solicitações:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar solicitações",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Carregando solicitações...</div>;
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
              {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: ptBR })}
            </TableCell>
            <TableCell>
              {format(new Date(request.start_date), 'dd/MM/yyyy', { locale: ptBR })}
            </TableCell>
            <TableCell>
              {format(new Date(request.end_date), 'dd/MM/yyyy', { locale: ptBR })}
            </TableCell>
            <TableCell className="text-center">{request.days_taken}</TableCell>
            <TableCell className="text-right">
              <Badge variant={statusMap[request.status].variant as any}>
                {statusMap[request.status].label}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default VacationRequests;
