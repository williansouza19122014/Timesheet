import { useEffect, useMemo, useState } from "react";
import { differenceInDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { mutateVacationData, createDefaultVacationEntry } from "@/utils/vacation-storage";
import { VacationPeriod, VacationRequest } from "@/types/vacations";

interface NewVacationRequestProps {
  userId: string;
  periods: VacationPeriod[];
  onSuccess: () => void;
  contractType: string;
  defaultPeriodId?: string;
  initialRequest?: VacationRequest | null;
  mode?: "create" | "edit";
}

const containerSurface =
  "space-y-6 rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white/96 via-white/92 to-slate-50/88 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.6)] dark:border-white/10 dark:from-slate-900/85 dark:via-slate-900/70 dark:to-slate-900/60";

const fieldSurface =
  "rounded-xl border border-slate-200/70 bg-white/90 text-slate-700 shadow-sm transition focus-visible:ring-2 focus-visible:ring-[#7C6CFF]/40 focus-visible:ring-offset-0 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100";

const subtleSurface =
  "rounded-xl border border-slate-200/60 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/55";

const DEFAULT_STATE = {
  selectedPeriod: "",
  startDate: "",
  endDate: "",
  comments: "",
  sellDays: false,
  daysToSell: 0,
};

const NewVacationRequest = ({
  userId,
  periods,
  onSuccess,
  contractType,
  defaultPeriodId,
  initialRequest = null,
  mode = "create",
}: NewVacationRequestProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    defaultPeriodId ?? initialRequest?.period_id ?? DEFAULT_STATE.selectedPeriod
  );
  const [startDate, setStartDate] = useState(initialRequest?.start_date ?? DEFAULT_STATE.startDate);
  const [endDate, setEndDate] = useState(initialRequest?.end_date ?? DEFAULT_STATE.endDate);
  const [comments, setComments] = useState(initialRequest?.comments ?? DEFAULT_STATE.comments);
  const [sellDays, setSellDays] = useState(Boolean(initialRequest?.sold_days ?? DEFAULT_STATE.sellDays));
  const [daysToSell, setDaysToSell] = useState<number>(initialRequest?.sold_days ?? DEFAULT_STATE.daysToSell);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isEditMode = mode === "edit" && Boolean(initialRequest);

  useEffect(() => {
    if (initialRequest) {
      setSelectedPeriod(initialRequest.period_id);
      setStartDate(initialRequest.start_date);
      setEndDate(initialRequest.end_date);
      setComments(initialRequest.comments ?? "");
      setSellDays(Boolean(initialRequest.sold_days));
      setDaysToSell(initialRequest.sold_days);
    }
  }, [initialRequest]);

  useEffect(() => {
    if (!initialRequest && defaultPeriodId) {
      setSelectedPeriod(defaultPeriodId);
    }
  }, [defaultPeriodId, initialRequest]);

  const selectedPeriodData = useMemo(
    () => periods.find((period) => period.id === selectedPeriod),
    [periods, selectedPeriod]
  );

  const resetForm = () => {
    setSelectedPeriod(defaultPeriodId ?? DEFAULT_STATE.selectedPeriod);
    setStartDate(DEFAULT_STATE.startDate);
    setEndDate(DEFAULT_STATE.endDate);
    setComments(DEFAULT_STATE.comments);
    setSellDays(DEFAULT_STATE.sellDays);
    setDaysToSell(DEFAULT_STATE.daysToSell);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedPeriod) {
      toast({
        variant: "destructive",
        title: "Selecione um periodo",
        description: "Escolha o periodo aquisitivo desejado.",
      });
      return;
    }

    const period = periods.find((p) => p.id === selectedPeriod);
    if (!period) {
      toast({
        variant: "destructive",
        title: "Periodo invalido",
        description: "O periodo selecionado nao esta disponivel.",
      });
      return;
    }

    let daysTaken = 0;
    if (startDate && endDate) {
      daysTaken = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
      if (daysTaken <= 0) {
        toast({
          variant: "destructive",
          title: "Datas invalidas",
          description: "A data final deve ser posterior ou igual a data inicial.",
        });
        return;
      }
    }

    const totalDaysRequested = daysTaken + (sellDays ? daysToSell : 0);

    const previousUsage =
      isEditMode && initialRequest ? (initialRequest.days_taken ?? 0) + (initialRequest.sold_days ?? 0) : 0;
    const availableForRequest = (() => {
      if (!selectedPeriodData) {
        return 0;
      }
      if (isEditMode && initialRequest && initialRequest.period_id === selectedPeriodData.id) {
        return selectedPeriodData.days_available + previousUsage;
      }
      return selectedPeriodData.days_available;
    })();

    if (totalDaysRequested > availableForRequest) {
      toast({
        variant: "destructive",
        title: "Saldo insuficiente",
        description: `Total de dias (${totalDaysRequested}) maior que o saldo disponivel (${availableForRequest}).`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      mutateVacationData(
        userId,
        () => createDefaultVacationEntry(userId),
        (entry) => {
          const nextEntry = { ...entry };
          const targetPeriodId = period.id;

          if (isEditMode && initialRequest) {
            const requestIndex = nextEntry.requests.findIndex((request) => request.id === initialRequest.id);
            if (requestIndex === -1) {
              return entry;
            }

            const previousTotalDays =
              (initialRequest.days_taken ?? 0) + (initialRequest.sold_days ? initialRequest.sold_days : 0);
            const previousPeriodIndex = nextEntry.periods.findIndex(
              (item) => item.id === initialRequest.period_id
            );

            if (previousPeriodIndex >= 0) {
              nextEntry.periods = nextEntry.periods.map((item, index) =>
                index === previousPeriodIndex
                  ? { ...item, days_available: item.days_available + previousTotalDays }
                  : item
              );
            }

            const newAvailable = nextEntry.periods.map((item) =>
              item.id === targetPeriodId
                ? {
                    ...item,
                    days_available: Math.max(item.days_available - totalDaysRequested, 0),
                  }
                : item
            );

            const updatedRequest: VacationRequest = {
              ...initialRequest,
              period_id: targetPeriodId,
              start_date: startDate || period.start_date,
              end_date: endDate || period.end_date,
              days_taken: daysTaken,
              comments: comments || undefined,
              sold_days: sellDays ? daysToSell : 0,
              status: "pending",
              payment_date: null,
              approved_by: undefined,
            };

            const requests = [...nextEntry.requests];
            requests[requestIndex] = updatedRequest;

            return {
              periods: newAvailable,
              requests,
            };
          }

          const updatedPeriods = nextEntry.periods.map((item) =>
            item.id === targetPeriodId
              ? {
                  ...item,
                  days_available: Math.max(item.days_available - totalDaysRequested, 0),
                }
              : item
          );

          const newRequest: VacationRequest = {
            id: crypto.randomUUID(),
            period_id: targetPeriodId,
            start_date: startDate || period.start_date,
            end_date: endDate || period.end_date,
            days_taken: daysTaken,
            status: "pending",
            comments: comments || undefined,
            sold_days: sellDays ? daysToSell : 0,
            payment_date: null,
            created_at: new Date().toISOString(),
            approved_by: undefined,
          };

          return {
            periods: updatedPeriods,
            requests: [newRequest, ...nextEntry.requests],
          };
        }
      );

      toast({
        title: isEditMode ? "Solicitacao atualizada" : "Solicitacao registrada",
        description: `Sua solicitacao de ${contractType === "PJ" ? "descanso" : "ferias"} foi enviada para aprovacao.`,
      });

      resetForm();
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSellingAllowed =
    !sellDays || daysToSell < (selectedPeriodData?.days_available ?? Number.POSITIVE_INFINITY);

  return (
    <form onSubmit={handleSubmit} className={containerSurface}>
      <div className="space-y-2">
        <Label htmlFor="period" className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Periodo aquisitivo*
        </Label>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod} disabled={isEditMode}>
          <SelectTrigger className={fieldSurface}>
            <SelectValue placeholder="Selecione o periodo" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((periodOption) => (
              <SelectItem key={periodOption.id} value={periodOption.id}>
                {format(new Date(periodOption.start_date), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                {format(new Date(periodOption.end_date), "dd/MM/yyyy", { locale: ptBR })} (
                {periodOption.days_available} dias disponiveis)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className={`${subtleSurface} flex items-start justify-between gap-4`}>
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-200">
              Vender dias de ferias
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ative para vender parte do saldo disponivel neste periodo.
            </p>
          </div>
          <Checkbox
            id="sell_days"
            checked={sellDays}
            onCheckedChange={(checked) => setSellDays(Boolean(checked))}
          />
        </div>

        {sellDays && (
          <div className="space-y-2">
            <Label
              htmlFor="days_to_sell"
              className="text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              Quantidade de dias para vender
            </Label>
            <Input
              id="days_to_sell"
              type="number"
              min={0}
              max={10}
              value={daysToSell}
              onChange={(event) => setDaysToSell(Number(event.target.value) || 0)}
              className={fieldSurface}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">Maximo permitido: 10 dias.</p>
          </div>
        )}
      </div>

      {isSellingAllowed && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_date" className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Data inicial
            </Label>
            <div className="relative">
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={fieldSurface}
              />
              <Calendar className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date" className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Data final
            </Label>
            <div className="relative">
              <Input
                id="end_date"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) => setEndDate(event.target.value)}
                className={fieldSurface}
              />
              <Calendar className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="comments" className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Observacoes
        </Label>
        <Textarea
          id="comments"
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Adicione observacoes se necessario"
          className={`${fieldSurface} min-h-[120px] resize-none text-sm`}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : isEditMode ? "Atualizar solicitacao" : "Solicitar ferias"}
      </Button>
    </form>
  );
};

export default NewVacationRequest;
