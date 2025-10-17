import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { addDays, addYears, format, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useVacations } from "@/hooks/use-vacations";
import { exportVacationsToCSV } from "@/utils/vacation-export";
import VacationsHeader from "@/components/vacations/VacationsHeader";
import VacationOverviewTable from "@/components/vacations/VacationOverviewTable";
import NewVacationRequest from "@/components/users/NewVacationRequest";
import { useAuth } from "@/hooks/useAuth";
import { mutateVacationData, createDefaultVacationEntry } from "@/utils/vacation-storage";
import { VacationPeriod, VacationRequest } from "@/types/vacations";
import { getVacationAlertThreshold } from "@/utils/preferences-storage";
import { useToast } from "@/hooks/use-toast";
import { fetchCurrentUserProfile } from "@/lib/users-api";

type DialogState =
  | {
      mode: "create" | "edit";
      period?: VacationPeriod | null;
      request?: VacationRequest | null;
    }
  | null;

type CancelState =
  | {
      period: VacationPeriod;
      request: VacationRequest;
    }
  | null;

type DisplayVacationPeriod = VacationPeriod & { isPreview?: boolean };

const stripDiacritics = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const normalizeContractType = (type?: string | null) => {
  if (!type) return "CLT";
  return stripDiacritics(type).toUpperCase();
};

const formatISODate = (date: Date) => format(date, "yyyy-MM-dd");

const Vacations = () => {
  const { periods, requests, isLoading, loadVacationData } = useVacations();
  const { user, isMaster } = useAuth();
  const { toast } = useToast();
  const [requestDialog, setRequestDialog] = useState<DialogState>(null);
  const [cancelDialog, setCancelDialog] = useState<CancelState>(null);
  const [viewDialog, setViewDialog] = useState<DisplayVacationPeriod | null>(null);
  const [periodsSnapshot, setPeriodsSnapshot] = useState<VacationPeriod[] | null>(null);
  const [alertThreshold, setAlertThreshold] = useState(() => getVacationAlertThreshold());
  const [profileContractType, setProfileContractType] = useState<string | null>(null);

  useEffect(() => {
    loadVacationData();
  }, [loadVacationData]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "timesheet-preferences") {
        setAlertThreshold(getVacationAlertThreshold());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!user?.id || profileContractType !== null) {
      return;
    }

    let active = true;

    const loadProfile = async () => {
      try {
        const profile = await fetchCurrentUserProfile();
        if (active) {
          setProfileContractType(profile.contractType ?? "");
        }
      } catch (error) {
        console.error("Não foi possível carregar o perfil do colaborador:", error);
        if (active) {
          setProfileContractType("");
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [user?.id, profileContractType]);

  const contractTypeSource =
    (profileContractType && profileContractType.trim()) || periods[0]?.contract_type || "CLT";
  const normalizedContractType = normalizeContractType(contractTypeSource);
  const usesFeriasLabel = normalizedContractType === "CLT" || normalizedContractType === "ESTAGIO";
  const currentUserId = user?.id ?? null;

  const extendedPeriods: DisplayVacationPeriod[] = useMemo(() => {
    if (!periods.length) {
      return [];
    }

    const sorted = [...periods].sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
    const lastPeriod = sorted[sorted.length - 1];
    const lastEnd = parseISO(lastPeriod.end_date);

    if (Number.isNaN(lastEnd.getTime())) {
      return sorted;
    }

    const nextStart = addDays(lastEnd, 1);
    const nextEnd = subDays(addYears(nextStart, 1), 1);
    const lastLimit = lastPeriod.limit_date ? parseISO(lastPeriod.limit_date) : null;
    const nextLimitDate =
      lastLimit && !Number.isNaN(lastLimit.getTime()) ? addYears(lastLimit, 1) : addYears(nextEnd, 1);

    const hasProjectedPeriod = sorted.some((item) => {
      const startDate = parseISO(item.start_date);
      return !Number.isNaN(startDate.getTime()) && startDate.getTime() >= nextStart.getTime();
    });

    if (hasProjectedPeriod) {
      return sorted;
    }

    const preview: DisplayVacationPeriod = {
      ...lastPeriod,
      id: `preview-${lastPeriod.id}`,
      start_date: formatISODate(nextStart),
      end_date: formatISODate(nextEnd),
      limit_date: formatISODate(nextLimitDate),
      days_available: 30,
      status: "upcoming",
      sold_days: 0,
      payment_date: null,
      isPreview: true,
      contract_type: lastPeriod.contract_type ?? contractTypeSource,
    };

    return [...sorted, preview];
  }, [periods, contractTypeSource]);

  const closeRequestDialog = () => {
    setRequestDialog(null);
    setPeriodsSnapshot(null);
  };
  const closeCancelDialog = () => setCancelDialog(null);
  const closeViewDialog = () => setViewDialog(null);

  const handleCreateRequest = ({
    period,
  }: {
    period: DisplayVacationPeriod;
    request?: VacationRequest | null;
  }) => {
    if (period.isPreview) {
      if (!user?.id) {
        toast({
          variant: "destructive",
          title: "Ação indisponível",
          description: "Não foi possível preparar o período futuro sem um usuário autenticado.",
        });
        return;
      }

      const updatedEntry = mutateVacationData(
        user.id,
        () => createDefaultVacationEntry(user.id),
        (entry) => {
          const alreadyExists = entry.periods.some(
            (item) => item.start_date === period.start_date && item.end_date === period.end_date
          );

          if (alreadyExists) {
            return entry;
          }

          const newPeriod: VacationPeriod = {
            id: crypto.randomUUID(),
            user_id: period.user_id,
            start_date: period.start_date,
            end_date: period.end_date,
            days_available: 30,
            limit_date: period.limit_date,
            status: "available",
            sold_days: 0,
            payment_date: null,
            contract_type: period.contract_type ?? contractTypeSource,
          };

          return {
            periods: [...entry.periods, newPeriod],
            requests: entry.requests,
          };
        }
      );

      const ensuredPeriod =
        updatedEntry.periods.find(
          (item) => item.start_date === period.start_date && item.end_date === period.end_date
        ) ?? null;

      if (!ensuredPeriod) {
        toast({
          variant: "destructive",
          title: "Não foi possível preparar o período",
          description: "Tente novamente em instantes.",
        });
        return;
      }

      setPeriodsSnapshot(updatedEntry.periods);
      setRequestDialog({
        mode: "create",
        period: ensuredPeriod,
        request: null,
      });
      void loadVacationData();
      return;
    }

    setPeriodsSnapshot(null);
    setRequestDialog({
      mode: "create",
      period,
      request: null,
    });
  };

  const handleEditRequest = ({
    period,
    request,
  }: {
    period: DisplayVacationPeriod;
    request?: VacationRequest | null;
  }) => {
    if (!request) return;
    setPeriodsSnapshot(null);
    setRequestDialog({
      mode: "edit",
      period,
      request,
    });
  };

  const handleCancelRequest = ({
    period,
    request,
  }: {
    period: DisplayVacationPeriod;
    request?: VacationRequest | null;
  }) => {
    if (!request) return;
    setCancelDialog({ period, request });
  };

  const handleConsultPeriod = ({
    period,
  }: {
    period: DisplayVacationPeriod;
    request?: VacationRequest | null;
  }) => {
    if (period.isPreview) {
      toast({
        title: "Histórico indisponível",
        description: "O período projetado ainda não possui dados para consulta.",
      });
      return;
    }
    setViewDialog(period);
  };

  const handleConfirmCancel = () => {
    if (!cancelDialog || !user?.id) return;

    mutateVacationData(
      user.id,
      () => createDefaultVacationEntry(user.id),
      (entry) => {
        const updatedPeriods = entry.periods.map((period) =>
          period.id === cancelDialog.request.period_id &&
          (cancelDialog.request.status === "pending" || cancelDialog.request.status === "denied")
            ? {
                ...period,
                days_available:
                  period.days_available +
                  (cancelDialog.request.days_taken ?? 0) +
                  (cancelDialog.request.sold_days ?? 0),
              }
            : period
        );

        const updatedRequests = entry.requests.map((request) =>
          request.id === cancelDialog.request.id
            ? {
                ...request,
                status: "cancelled",
              }
            : request
        );

        return {
          periods: updatedPeriods,
          requests: updatedRequests,
        };
      }
    );

    toast({
      title: "Solicitação cancelada",
      description: "A solicitação selecionada foi cancelada.",
    });

    closeCancelDialog();
    void loadVacationData();
  };

  const handleRequestSuccess = () => {
    closeRequestDialog();
    void loadVacationData();
  };

  const viewRequests = useMemo(() => {
    if (!viewDialog) return [];
    return requests.filter((request) => request.period_id === viewDialog.id);
  }, [viewDialog, requests]);

  const calculateTotals = (period: VacationPeriod, periodRequests: VacationRequest[]) => {
    const approvedRequests = periodRequests.filter((request) => request.status === "approved");
    const usedDays = approvedRequests.reduce((total, item) => total + (item.days_taken ?? 0), 0);
    const soldDays = approvedRequests.reduce((total, item) => total + (item.sold_days ?? 0), 0);
    const saldo = period.days_available;

    return {
      totalPrevisto: saldo + usedDays + soldDays,
      usedDays,
      soldDays,
      saldo,
    };
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <VacationsHeader
        onExport={() => exportVacationsToCSV(periods, requests)}
        contractType={contractTypeSource}
        title={usesFeriasLabel ? "Férias" : "Descanso Remunerado"}
      />

      <VacationOverviewTable
        periods={extendedPeriods}
        requests={requests}
        alertThreshold={alertThreshold}
        currentUserId={currentUserId}
        canOverrideApproval={isMaster}
        onCreate={handleCreateRequest}
        onEdit={handleEditRequest}
        onCancel={handleCancelRequest}
        onConsult={handleConsultPeriod}
      />

      <Dialog open={Boolean(requestDialog)} onOpenChange={(open) => !open && closeRequestDialog()}>
        <DialogContent className="max-w-3xl rounded-3xl border border-slate-200/80 bg-white/95 text-slate-900 shadow-2xl dark:border-slate-800/70 dark:bg-slate-950/95 dark:text-slate-100">
          <DialogHeader>
            <DialogTitle>
              {requestDialog?.mode === "edit"
                ? "Editar solicitação"
                : usesFeriasLabel
                ? "Nova solicitação de férias"
                : "Nova solicitação de descanso"}
            </DialogTitle>
          </DialogHeader>
          <NewVacationRequest
            userId={user?.id ?? ""}
            periods={periodsSnapshot ?? periods}
            onSuccess={handleRequestSuccess}
            contractType={contractTypeSource || "CLT"}
            defaultPeriodId={requestDialog?.period?.id}
            initialRequest={requestDialog?.request ?? null}
            mode={requestDialog?.mode ?? "create"}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewDialog)} onOpenChange={(open) => !open && closeViewDialog()}>
        <DialogContent className="max-w-2xl rounded-3xl border border-slate-200/80 bg-white/95 text-slate-900 shadow-xl dark:border-slate-800/70 dark:bg-slate-950/95 dark:text-slate-100">
          <DialogHeader>
            <DialogTitle>Histórico do período</DialogTitle>
          </DialogHeader>

          {viewDialog && (
            <div className="space-y-6 text-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800/70 dark:bg-slate-900/40">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Período aquisitivo
                  </p>
                  <p className="mt-1 text-base font-medium text-slate-900 dark:text-slate-100">
                    {format(parseISO(viewDialog.start_date), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                    {format(parseISO(viewDialog.end_date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800/70 dark:bg-slate-900/40">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Limite para uso
                  </p>
                  <p className="mt-1 text-base font-medium text-slate-900 dark:text-slate-100">
                    {viewDialog.limit_date
                      ? format(parseISO(viewDialog.limit_date), "dd/MM/yyyy", { locale: ptBR })
                      : "Sem limite registrado"}
                  </p>
                </div>
              </div>

              {(() => {
                const totals = calculateTotals(viewDialog, viewRequests);
                return (
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 text-slate-700 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-200">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Total previsto
                      </p>
                      <p className="mt-1 text-lg font-semibold">{totals.totalPrevisto} dias</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 text-slate-700 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-200">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Dias usufruídos
                      </p>
                      <p className="mt-1 text-lg font-semibold">{totals.usedDays} dias</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 text-slate-700 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-200">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Saldo disponível
                      </p>
                      <p className="mt-1 text-lg font-semibold">{totals.saldo} dias</p>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Solicitações registradas</h4>
                {viewRequests.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Não há solicitações vinculadas a este período até o momento.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200/70 bg-white/80 dark:divide-slate-800 dark:border-slate-800/70 dark:bg-slate-900/50">
                    {viewRequests.map((request) => (
                      <li key={request.id} className="flex flex-col gap-1 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 md:flex-row md:items-center md:justify-between">
                        <span>
                          {format(parseISO(request.start_date), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                          {format(parseISO(request.end_date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Status: {request.status === "approved" ? "Aprovado" : request.status === "pending" ? "Pendente" : request.status === "denied" ? "Negado" : "Cancelado"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(cancelDialog)} onOpenChange={(open) => !open && closeCancelDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar solicitação</AlertDialogTitle>
            <AlertDialogDescription>
              Confirme para cancelar a solicitação selecionada. Se ela estiver pendente, os dias serão devolvidos ao saldo do período.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeCancelDialog}>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>Cancelar solicitação</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Vacations;
