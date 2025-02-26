
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { VacationPeriod, VacationRequest } from "@/types/vacations";

export const exportVacationsToCSV = (periods: VacationPeriod[], requests: VacationRequest[]) => {
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
