import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { VacationRequest } from "@/types/vacations";

interface RequestsTableProps {
  requests: VacationRequest[];
  isPJ?: boolean;
}

const statusLabel = (status: VacationRequest["status"]) => {
  switch (status) {
    case "approved":
      return "Aprovado";
    case "pending":
      return "Pendente";
    case "denied":
      return "Negado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
};

const statusClassName = (status: VacationRequest["status"]) => {
  switch (status) {
    case "approved":
      return "border-transparent bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300";
    case "pending":
      return "border-transparent bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-200";
    case "denied":
    case "cancelled":
      return "border-transparent bg-rose-500/15 text-rose-600 dark:bg-rose-400/15 dark:text-rose-200";
    default:
      return "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300";
  }
};

const RequestsTable = ({ requests, isPJ = false }: RequestsTableProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Solicitação de {isPJ ? "Descanso" : "Férias"}
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/60">
            <TableRow className="border-b border-slate-200 dark:border-slate-800">
              <TableHead className="text-slate-600 dark:text-slate-300">Período</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">Dias</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">Status</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">Venda</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">Pagamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow
                key={request.id}
                className="border-b border-slate-200 transition hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-900/60"
              >
                <TableCell className="text-sm text-slate-700 dark:text-slate-200">
                  {format(new Date(request.start_date), "dd/MM/yyyy", { locale: ptBR })} -
                  {" "}
                  {format(new Date(request.end_date), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell className="text-sm text-slate-700 dark:text-slate-200">
                  {request.days_taken} dias
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusClassName(request.status)}>{statusLabel(request.status)}</Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-700 dark:text-slate-200">
                  {request.sold_days ? `${request.sold_days} dias` : "?"}
                </TableCell>
                <TableCell className="text-sm text-slate-700 dark:text-slate-200">
                  {request.payment_date
                    ? format(new Date(request.payment_date), "dd/MM/yyyy", { locale: ptBR })
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

export default RequestsTable;
