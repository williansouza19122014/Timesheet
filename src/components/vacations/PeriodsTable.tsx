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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Períodos {isPJ ? "de Descanso" : "Aquisitivos"}
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/60">
            <TableRow className="border-b border-slate-200 dark:border-slate-800">
              <TableHead className="text-slate-600 dark:text-slate-300">
                Período {isPJ ? "de Descanso" : "Aquisitivo"}
              </TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">Saldo (dias)</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">
                Limite para {isPJ ? "Descanso" : "Gozo"}
              </TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">Venda de dias</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">Data do pagamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periods.map((period) => (
              <TableRow
                key={period.id}
                className="border-b border-slate-200 transition hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-900/60"
              >
                <TableCell className="text-sm text-slate-700 dark:text-slate-200">
                  {format(new Date(period.start_date), "dd/MM/yyyy", { locale: ptBR })} -
                  {" "}
                  {format(new Date(period.end_date), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell className="text-sm text-slate-700 dark:text-slate-200">
                  {period.days_available} dias
                </TableCell>
                <TableCell className="text-sm text-slate-700 dark:text-slate-200">
                  {period.limit_date
                    ? format(new Date(period.limit_date), "dd/MM/yyyy", { locale: ptBR })
                    : "?"}
                </TableCell>
                <TableCell className="text-sm text-slate-700 dark:text-slate-200">
                  {period.sold_days ? `${period.sold_days} dias` : "?"}
                </TableCell>
                <TableCell className="text-sm text-slate-700 dark:text-slate-200">
                  {period.payment_date
                    ? format(new Date(period.payment_date), "dd/MM/yyyy", { locale: ptBR })
                    : "?"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default PeriodsTable;
