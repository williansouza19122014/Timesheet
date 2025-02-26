
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import NewVacationRequest from "@/components/users/NewVacationRequest";

interface VacationPeriod {
  id: string;
  start_date: string;
  end_date: string;
  days_available: number;
  user_id: string;
}

interface VacationRequest {
  id: string;
  start_date: string;
  end_date: string;
  days_taken: number;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  comments?: string;
}

const Vacations = () => {
  const [periods, setPeriods] = useState<VacationPeriod[]>([]);
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadVacationData = async () => {
    try {
      setIsLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) return;

      const [periodsResponse, requestsResponse] = await Promise.all([
        supabase
          .from('vacation_periods')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('start_date', { ascending: false }),
        supabase
          .from('vacation_requests')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false })
      ]);

      if (periodsResponse.error) throw periodsResponse.error;
      if (requestsResponse.error) throw requestsResponse.error;

      setPeriods(periodsResponse.data || []);
      setRequests(requestsResponse.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados de férias:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVacationData();
  }, []);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Férias</h2>
          <p className="text-muted-foreground">
            Gerencie seus períodos aquisitivos e solicite férias
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Solicitação de Férias</DialogTitle>
            </DialogHeader>
            <NewVacationRequest
              userId={periods[0]?.user_id || ''}
              periods={periods}
              onSuccess={() => {
                loadVacationData();
                toast({
                  title: "Solicitação enviada",
                  description: "Sua solicitação de férias foi enviada para aprovação"
                });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Períodos Aquisitivos</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead className="text-right">Dias Disponíveis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((period, index) => (
                <TableRow key={period.id}>
                  <TableCell>{index + 1}º Período</TableCell>
                  <TableCell>
                    {format(new Date(period.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(period.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {period.days_available} dias
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Solicitações</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data da Solicitação</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Dias</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {format(new Date(request.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                    {' - '}
                    {format(new Date(request.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{request.days_taken} dias</TableCell>
                  <TableCell>
                    <Badge variant={
                      request.status === 'approved' ? 'default' :
                      request.status === 'pending' ? 'secondary' :
                      request.status === 'denied' ? 'destructive' :
                      'outline'
                    }>
                      {request.status === 'approved' && 'Aprovado'}
                      {request.status === 'pending' && 'Pendente'}
                      {request.status === 'denied' && 'Negado'}
                      {request.status === 'cancelled' && 'Cancelado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {request.comments}
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

export default Vacations;
