import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimeEntryActionsProps {
  onRegisterTime: () => void;
  onRequestCorrection: () => void;
}

const TimeEntryActions = ({ onRegisterTime, onRequestCorrection }: TimeEntryActionsProps) => {
  return (
    <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
      <div className="space-y-1 text-center md:text-left">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Registro de Horas</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Registre suas marcacoes ou solicite ajustes quando necessario.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onRegisterTime} className="min-w-[180px]">
          <Clock className="h-4 w-4" />
          Registrar Ponto
        </Button>
        <Button
          variant="outline"
          onClick={onRequestCorrection}
          className="min-w-[180px]"
        >
          Solicitar Correcao
        </Button>
      </div>
    </div>
  );
};

export default TimeEntryActions;