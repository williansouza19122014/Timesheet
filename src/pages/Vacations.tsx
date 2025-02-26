
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, AlertCircle } from "lucide-react";
import { format, parseISO, addMonths } from "date-fns";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import NewVacationRequest from "@/components/users/NewVacationRequest";

interface VacationPeriod {
  id: string;
  start_date: string;
  end_date: string;
  days_available: number;
  user_id: string;
  limit_date: string | null;
  status: string;
  sold_days: number;
  payment_date: string | null;
  contract_type: string;
}

interface VacationRequest {
  id: string;
  start_date: string;
  end_date: string;
  days_taken: number;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  comments?: string;
  sold_days: number;
  payment_date: string | null;
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

  const exportToCSV = () => {
    const headers = [
      "Período Aquisitivo",
      "Saldo (dias)",
      "Limite para Gozo",
      "Início das Férias",
      "Fim das Férias",
      "Venda de Dias",
      "Data do Pagamento"
    ];

    const rows = periods.map(period => {
      const request = requests.find(r => 
        r.start_date >= period.start_date && 
        r.start_date <= period.end_date
      );

      return [
        `${format(new Date(period.start_date), 'dd/MM/yyyy')} - ${format(new Date(period.end_date), 'dd/MM/yyyy')}`,
        period.days_available,
        period.limit_date ? format(new Date(period.limit_date), 'dd/MM/yyyy') : '--',
        request?.start_date ? format(new Date(request.start_date), 'dd/MM/yyyy') : '--',
        request?.end_date ? format(new Date(request.end_date), 'dd/MM/yyyy') : '--',
        period.sold_days ? `${period.sold_days} DIAS` : '--',
        period.payment_date ? format(new Date(period.payment_date), 'dd/MM/yyyy') : '--'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ferias.csv';
    link.click();
  };

  useEffect(() => {
    loadVacationData();
  }, []);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Verifica períodos próximos do vencimento (3 meses)
  const expiringPeriods = periods.filter(period => {
    if (!period.limit_date) return false;
    const limitDate = new Date(period.limit_date);
    const threeMonthsFromNow = addMonths(new Date(), 3);
    return limitDate <= threeMonthsFromNow && period.days_available > 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Férias</h2>
          <p className="text-muted-foreground">
            Gerencie seus períodos aquisitivos e solicite férias
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <FileDown className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Solicitação
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
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
                contractType={periods[0]?.contract_type || 'CLT'}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {expiringPeriods.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            Você tem {expiringPeriods.length} período(s) de férias próximo(s) do vencimento.
            Por favor, programe suas férias em breve.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Períodos Aquisitivos</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período Aquisitivo</TableHead>
                <TableHead>Saldo (dias)</TableHead>
                <TableHead>Limite para Gozo</TableHead>
                <TableHead>Venda de Dias</TableHead>
                <TableHead>Data do Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell>
                    {format(new Date(period.start_date), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(period.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{period.days_available} dias</TableCell>
                  <TableCell>
                    {period.limit_date 
                      ? format(new Date(period.limit_date), 'dd/MM/yyyy', { locale: ptBR })
                      : '--'}
                  </TableCell>
                  <TableCell>{period.sold_days ? `${period.sold_days} DIAS` : '--'}</TableCell>
                  <TableCell>
                    {period.payment_date 
                      ? format(new Date(period.payment_date), 'dd/MM/yyyy', { locale: ptBR })
                      : '--'}
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
                <TableHead>Período</TableHead>
                <TableHead>Dias</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Venda</TableHead>
                <TableHead>Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {format(new Date(request.start_date), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(request.end_date), 'dd/MM/yyyy', { locale: ptBR })}
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
                  <TableCell>{request.sold_days ? `${request.sold_days} DIAS` : '--'}</TableCell>
                  <TableCell>
                    {request.payment_date 
                      ? format(new Date(request.payment_date), 'dd/MM/yyyy', { locale: ptBR })
                      : '--'}
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
