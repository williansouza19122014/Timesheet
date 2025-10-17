import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VacationPeriod, VacationRequest } from "@/types/vacations";

type DisplayVacationPeriod = VacationPeriod & { isPreview?: boolean };

type RowActionHandler = (payload: { period: DisplayVacationPeriod; request?: VacationRequest | null }) => void;

interface VacationOverviewTableProps {
  periods: DisplayVacationPeriod[];
  requests: VacationRequest[];
  alertThreshold: number;
  onCreate: RowActionHandler;
  onEdit: RowActionHandler;
  onCancel: RowActionHandler;
  onConsult: RowActionHandler;
  currentUserId?: string | null;
  canOverrideApproval?: boolean;
}

const calculatePeriodTotals = (period: VacationPeriod, periodRequests: VacationRequest[]) => {
  const approvedRequests = periodRequests.filter((request) => request.status === "approved");
  const usedDays = approvedRequests.reduce((total, item) => total + (item.days_taken ?? 0), 0);
  const soldDays = approvedRequests.reduce((total, item) => total + (item.sold_days ?? 0), 0);
  const saldo = period.days_available;

  return {
    totalPrevisto: saldo + usedDays + soldDays,
    usedDays,
    saldo,
  };
};

const requestStatusLabel = (status: VacationRequest["status"]) => {
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

const requestStatusStyle = (status: VacationRequest["status"]) => {
  switch (status) {
    case "approved":
      return "border-transparent bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-200";
    case "pending":
      return "border-transparent bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-200";
    case "denied":
      return "border-transparent bg-rose-500/15 text-rose-600 dark:bg-rose-400/15 dark:text-rose-200";
    case "cancelled":
      return "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300";
  }
};

const periodStatusLabel = (status: "ok" | "warning" | "expired") => {
  switch (status) {
    case "ok":
      return "Dentro do prazo";
    case "warning":
      return "No limite";
    case "expired":
      return "Vencido";
    default:
      return status;
  }
};

const periodStatusStyle = (status: "ok" | "warning" | "expired") => {
  switch (status) {
    case "ok":
      return "border-transparent bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-200";
    case "warning":
      return "border-transparent bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-200";
    case "expired":
      return "border-transparent bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-200";
    default:
      return "border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300";
  }
};

const sortRequestsByRecency = (requests: VacationRequest[]): VacationRequest[] =>
  [...requests].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

const VacationOverviewTable = ({
  periods,
  requests,
  alertThreshold,
  onCreate,
  onEdit,
  onCancel,
  onConsult,
  currentUserId,
  canOverrideApproval = false,
}: VacationOverviewTableProps) => {
  const now = new Date();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Gerenciamento de férias e descansos</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitore períodos aquisitivos, saldos e limites em um único painel.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-slate-800/70">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/60">
            <TableRow className="border-b border-slate-200 dark:border-slate-800">
              <TableHead className="min-w-[200px] text-slate-600 dark:text-slate-300">Período aquisitivo</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">Total previsto</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">Dias usufruídos</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">Saldo disponível</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">Limite</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">Solicitação atual</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">Situação</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-300">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periods.map((period) => {
              const periodLimit = period.limit_date ? parseISO(period.limit_date) : null;
              let periodStatus: "ok" | "warning" | "expired" = "ok";
              if (periodLimit) {
                const diff = differenceInDays(periodLimit, now);
                if (diff < 0) {
                  periodStatus = "expired";
                } else if (diff <= alertThreshold) {
                  periodStatus = "warning";
                }
              }

              const periodRequests = sortRequestsByRecency(
                requests.filter((request) => request.period_id === period.id)
              );
              const currentRequest =
                periodRequests.find((request) => request.status !== "cancelled") ?? null;
              const hasRequest = Boolean(currentRequest);
              const requestStatus = currentRequest?.status ?? "sem_solicitacao";
              const totals = calculatePeriodTotals(period, periodRequests);

              const requestPeriodLabel = currentRequest
                ? `${format(new Date(currentRequest.start_date), "dd/MM/yyyy", { locale: ptBR })} - ${format(new Date(currentRequest.end_date), "dd/MM/yyyy", { locale: ptBR })}`
                : "Sem solicitação";

              const canEdit =
                hasRequest &&
                requestStatus !== "denied" &&
                requestStatus !== "cancelled" &&
                (requestStatus !== "approved" ||
                  canOverrideApproval ||
                  (currentRequest?.approved_by && currentRequest.approved_by === currentUserId));

              const canCancel =
                hasRequest &&
                requestStatus !== "cancelled" &&
                (requestStatus !== "approved" ||
                  canOverrideApproval ||
                  (currentRequest?.approved_by && currentRequest.approved_by === currentUserId));

              return (
                <TableRow
                  key={period.id}
                  className="border-b border-slate-200 transition hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-900/60"
                >
                  <TableCell className="align-middle text-sm text-slate-700 dark:text-slate-200">
                    <div className="flex flex-wrap items-center gap-3 whitespace-nowrap">
                      <span>
                        {format(new Date(period.start_date), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                        {format(new Date(period.end_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <Badge variant="outline" className={periodStatusStyle(periodStatus)}>
                        {periodStatusLabel(periodStatus)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {totals.totalPrevisto} dias
                  </TableCell>
                  <TableCell className="align-middle text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {totals.usedDays} dias
                  </TableCell>
                  <TableCell className="align-middle text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {totals.saldo} dias
                  </TableCell>
                  <TableCell className="align-middle text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {period.limit_date
                      ? format(new Date(period.limit_date), "dd/MM/yyyy", { locale: ptBR })
                      : "--"}
                  </TableCell>
                  <TableCell className="align-middle text-sm text-slate-700 dark:text-slate-200">
                    {hasRequest ? (
                      <span className="whitespace-nowrap">{requestPeriodLabel}</span>
                    ) : (
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Sem solicitação
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="align-middle">
                    {hasRequest ? (
                      <Badge variant="outline" className={requestStatusStyle(currentRequest!.status)}>
                        {requestStatusLabel(currentRequest!.status)}
                      </Badge>
                    ) : (
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Aguardando solicitação
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="align-middle">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onConsult({ period, request: currentRequest ?? null })}
                        disabled={Boolean(period.isPreview)}
                      >
                        Consultar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCreate({ period, request: currentRequest ?? null })}
                      >
                        Solicitar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => currentRequest && onEdit({ period, request: currentRequest })}
                        disabled={!canEdit}
                      >
                        Alterar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => currentRequest && onCancel({ period, request: currentRequest })}
                        disabled={!canCancel}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {periods.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Nenhum período cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default VacationOverviewTable;
