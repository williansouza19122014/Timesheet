import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import NewVacationRequest from "@/components/users/NewVacationRequest";
import { VacationPeriod } from "@/types/vacations";

interface VacationsHeaderProps {
  periods: VacationPeriod[];
  onExport: () => void;
  onRequestSuccess: () => void;
  isPJ?: boolean;
}

const VacationsHeader = ({ periods, onExport, onRequestSuccess, isPJ = false }: VacationsHeaderProps) => {
  const { toast } = useToast();
  const title = isPJ ? "Descanso Remunerado" : "Ferias";
  const description = isPJ
    ? "Gerencie seus periodos de descanso remunerado"
    : "Gerencie periodos aquisitivos, solicitacoes e pagamentos";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-[#f1f4ff] via-white to-[#f8f9ff] p-8 shadow-sm dark:border-slate-800/70 dark:from-[#0f172a] dark:via-[#111827] dark:to-[#1f2937]">
      <div className="absolute -right-28 -top-28 h-56 w-56 rounded-full bg-[#7355f6]/20 blur-3xl dark:bg-[#4c43f6]/25" aria-hidden />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 self-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#7355f6] shadow-sm ring-1 ring-[#7355f6]/20 dark:bg-slate-900/60 dark:text-[#c6c2ff] dark:ring-[#4c43f6]/30">
            {isPJ ? "Visao flexivel" : "Visao consolidada"}
          </span>
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={onExport}
            className="min-w-[180px]"
          >
            <FileDown className="h-4 w-4" />
            Exportar relatorio
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="min-w-[200px]">
                <Plus className="h-4 w-4" />
                Nova solicitacao
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl rounded-3xl border border-slate-200/80 bg-white/95 text-slate-900 shadow-2xl dark:border-slate-800/70 dark:bg-slate-950/95 dark:text-slate-100">
              <DialogHeader className="border-b border-slate-200/70 px-6 py-4 dark:border-slate-800/70">
                <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Nova solicitacao de {isPJ ? "descanso" : "ferias"}
                </DialogTitle>
              </DialogHeader>
              <div className="px-6 py-5">
                <NewVacationRequest
                  userId={periods[0]?.user_id || ""}
                  periods={periods}
                  onSuccess={() => {
                    onRequestSuccess();
                    toast({
                      title: "Solicitacao enviada",
                      description: `Sua solicitacao de ${isPJ ? "descanso" : "ferias"} foi enviada para aprovacao.`,
                    });
                  }}
                  contractType={periods[0]?.contract_type || "CLT"}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};

export default VacationsHeader;
