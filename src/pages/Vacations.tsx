
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { VacationPeriod, VacationRequest } from "@/types/vacations";
import VacationsHeader from "@/components/vacations/VacationsHeader";
import ExpiringPeriodsAlert from "@/components/vacations/ExpiringPeriodsAlert";
import PeriodsTable from "@/components/vacations/PeriodsTable";
import RequestsTable from "@/components/vacations/RequestsTable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
        `${format(new Date(period.start_date), 'dd/MM/yyyy', { locale: ptBR })} - ${format(new Date(period.end_date), 'dd/MM/yyyy', { locale: ptBR })}`,
        period.days_available,
        period.limit_date ? format(new Date(period.limit_date), 'dd/MM/yyyy', { locale: ptBR }) : '--',
        request?.start_date ? format(new Date(request.start_date), 'dd/MM/yyyy', { locale: ptBR }) : '--',
        request?.end_date ? format(new Date(request.end_date), 'dd/MM/yyyy', { locale: ptBR }) : '--',
        period.sold_days ? `${period.sold_days} DIAS` : '--',
        period.payment_date ? format(new Date(period.payment_date), 'dd/MM/yyyy', { locale: ptBR }) : '--'
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

  return (
    <div className="space-y-6">
      <VacationsHeader 
        periods={periods}
        onExport={exportToCSV}
        onRequestSuccess={loadVacationData}
      />

      <ExpiringPeriodsAlert periods={periods} />

      <div className="space-y-6">
        <PeriodsTable periods={periods} />
        <RequestsTable requests={requests} />
      </div>
    </div>
  );
};

export default Vacations;
