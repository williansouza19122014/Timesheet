
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthNavigationProps {
  selectedMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onResetMonth: () => void;
}

const MonthNavigation = ({
  selectedMonth,
  onPreviousMonth,
  onNextMonth,
  onResetMonth,
}: MonthNavigationProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onPreviousMonth}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-medium">
          {format(selectedMonth, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <button
          onClick={onNextMonth}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <button
        onClick={onResetMonth}
        className="text-sm text-accent hover:underline"
      >
        Voltar para mês atual
      </button>
    </div>
  );
};

export default MonthNavigation;
