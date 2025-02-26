
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

interface VacationPeriod {
  id: string;
  start_date: string;
  end_date: string;
  days_available: number;
}

interface VacationPeriodsProps {
  periods: VacationPeriod[];
  isLoading: boolean;
}

const VacationPeriods = ({ periods, isLoading }: VacationPeriodsProps) => {
  if (isLoading) {
    return <div>Carregando períodos...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Período Aquisitivo</TableHead>
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
            <TableCell className="text-right">{period.days_available}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default VacationPeriods;
