
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { VacationPeriod } from "@/types/vacations";

interface PeriodsTableProps {
  periods: VacationPeriod[];
  isPJ?: boolean;
}

const PeriodsTable = ({ periods, isPJ = false }: PeriodsTableProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Períodos {isPJ ? 'de Descanso' : 'Aquisitivos'}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Período {isPJ ? 'de Descanso' : 'Aquisitivo'}</TableHead>
            <TableHead>Saldo (dias)</TableHead>
            <TableHead>Limite para {isPJ ? 'Descanso' : 'Gozo'}</TableHead>
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
  );
};

export default PeriodsTable;
