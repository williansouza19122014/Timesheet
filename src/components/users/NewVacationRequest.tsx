import { useState } from "react";
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
}

const containerSurface =
  "space-y-6 rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white/96 via-white/92 to-slate-50/88 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.6)] dark:border-white/10 dark:from-slate-900/85 dark:via-slate-900/70 dark:to-slate-900/60";

const fieldSurface =
  "rounded-xl border border-slate-200/70 bg-white/90 text-slate-700 shadow-sm transition focus-visible:ring-2 focus-visible:ring-[#7C6CFF]/40 focus-visible:ring-offset-0 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100";

const subtleSurface =
  "rounded-xl border border-slate-200/60 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/55";

const NewVacationRequest = ({ userId, periods, onSuccess, contractType }: NewVacationRequestProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [comments, setComments] = useState("");
  const [sellDays, setSellDays] = useState(false);
  const [daysToSell, setDaysToSell] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedPeriod) {
      toast({
        variant: "destructive",
        title: "Selecione um período",
        description: "Escolha o período aquisitivo desejado.",
      });
      return;
    }

    const period = periods.find((p) => p.id === selectedPeriod);
    if (!period) {
      toast({
        variant: "destructive",
        title: "Período inválido",
        description: "O período selecionado não está disponível.",
      });
      return;
    }

    let daysTaken = 0;
    if (startDate && endDate) {
      daysTaken = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
      if (daysTaken <= 0) {
        toast({
          variant: "destructive",
          title: "Datas inválidas",
          description: "A data final deve ser posterior ou igual à data inicial.",
        });
        return;
      }
    }

    const totalDaysRequested = daysTaken + (sellDays ? daysToSell : 0);

    if (totalDaysRequested > period.days_available) {
      toast({
        variant: "destructive",
        title: "Saldo insuficiente",
        description: `Total de dias (${totalDaysRequested}) maior que o saldo disponível (${period.days_available}).`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      mutateVacationData(
        userId,
        () => createDefaultVacationEntry(userId),
        (entry) => {
          const newRequest: VacationRequest = {
            id: crypto.randomUUID(),
            start_date: startDate || period.start_date,
            end_date: endDate || period.end_date,
            days_taken: daysTaken,
            status: "pending",
            comments: comments || undefined,
            sold_days: sellDays ? daysToSell : 0,
            payment_date: null,
            created_at: new Date().toISOString(),
          };

          const updatedPeriods = entry.periods.map((item) =>
            item.id === period.id
              ? {
                  ...item,
                  days_available: Math.max(item.days_available - totalDaysRequested, 0),
                }
              : item
          );

          return {
            periods: updatedPeriods,
            requests: [newRequest, ...entry.requests],
          };
        }
      );

      toast({
        title: "Solicitação registrada",
        description: `Sua solicitação de ${contractType === "PJ" ? "descanso" : "férias"} foi enviada para aprovação.`,
      });

      onSuccess();
      setStartDate("");
      setEndDate("");
      setComments("");
      setSellDays(false);
      setDaysToSell(0);
    } catch (error) {
      console.error("Erro ao solicitar férias:", error);
      toast({
        variant: "destructive",
        title: "Erro ao solicitar férias",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPeriodData = periods.find((p) => p.id === selectedPeriod);

  return (
    <form onSubmit={handleSubmit} className={containerSurface}>
      <div className="space-y-2">
        <Label htmlFor="period" className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Período aquisitivo*
        </Label>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className={fieldSurface}>
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((periodOption) => (
              <SelectItem key={periodOption.id} value={periodOption.id}>
                {format(new Date(periodOption.start_date), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                {format(new Date(periodOption.end_date), "dd/MM/yyyy", { locale: ptBR })} (
                {periodOption.days_available} dias disponíveis)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className={`${subtleSurface} flex items-start justify-between gap-4`}>
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-200">
              Vender dias de férias
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ative para vender parte do saldo disponível neste período.
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
            <p className="text-xs text-slate-500 dark:text-slate-400">Máximo permitido: 10 dias.</p>
          </div>
        )}
      </div>

      {(!sellDays ||
        daysToSell < (selectedPeriodData?.days_available ?? Number.POSITIVE_INFINITY)) && (
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
          Observações
        </Label>
        <Textarea
          id="comments"
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Adicione observações se necessário"
          className={`${fieldSurface} min-h-[120px] resize-none text-sm`}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Solicitar férias"}
      </Button>
    </form>
  );
};

export default NewVacationRequest;
