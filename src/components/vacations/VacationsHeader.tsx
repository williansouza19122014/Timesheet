import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface VacationsHeaderProps {
  onExport: () => void;
  contractType: string;
  title?: string;
}

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

const mapContractLabel = (contractType: string) => {
  const normalized = normalize(contractType);
  switch (normalized) {
    case "PJ":
      return "Perfil PJ";
    case "ESTAGIO":
      return "Perfil Estagiário";
    case "TEMPORARIO":
      return "Perfil Temporário";
    case "CLT":
      return "Perfil CLT";
    default:
      return `Perfil ${contractType}`;
  }
};

const VacationsHeader = ({ onExport, contractType, title }: VacationsHeaderProps) => {
  const normalizedType = normalize(contractType);
  const heading = title ?? (normalizedType === "PJ" ? "Descanso Remunerado" : "Férias");
  const badgeLabel = mapContractLabel(contractType);
  const helperText =
    normalizedType === "PJ"
      ? "Organize descansos remunerados e visualize rapidamente os saldos."
      : "Acompanhe períodos aquisitivos, solicitações e saldo atualizado.";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-[#f1f4ff] via-white to-[#f8f9ff] p-8 shadow-sm dark:border-slate-800/70 dark:from-[#0f172a] dark:via-[#111827] dark:to-[#1f2937]">
      <div className="absolute -right-28 -top-28 h-56 w-56 rounded-full bg-[#7355f6]/20 blur-3xl dark:bg-[#4c43f6]/25" aria-hidden />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 self-center rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#7355f6] shadow-sm ring-1 ring-[#7355f6]/20 dark:bg-slate-900/60 dark:text-[#c6c2ff] dark:ring-[#4c43f6]/30">
            {badgeLabel}
          </span>
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{heading}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{helperText}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" onClick={onExport} className="min-w-[180px]">
            <FileDown className="h-4 w-4" />
            Exportar relatório
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VacationsHeader;
