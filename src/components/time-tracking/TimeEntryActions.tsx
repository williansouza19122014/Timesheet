
import { Clock } from "lucide-react";

interface TimeEntryActionsProps {
  onRegisterTime: () => void;
  onRequestCorrection: () => void;
}

const TimeEntryActions = ({ onRegisterTime, onRequestCorrection }: TimeEntryActionsProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-4xl font-bold">Registro de Horas</h1>
      <div className="flex gap-2">
        <button
          onClick={onRegisterTime}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Clock className="w-5 h-5" />
          Registrar Ponto
        </button>
        <button
          onClick={onRequestCorrection}
          className="px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors"
        >
          Solicitar Correção
        </button>
      </div>
    </div>
  );
};

export default TimeEntryActions;
