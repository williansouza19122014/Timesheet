
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { VacationPeriod } from "@/types/vacations";
import { addMonths } from "date-fns";

interface ExpiringPeriodsAlertProps {
  periods: VacationPeriod[];
  isPJ?: boolean;
}

const ExpiringPeriodsAlert = ({ periods, isPJ = false }: ExpiringPeriodsAlertProps) => {
  const expiringPeriods = periods.filter(period => {
    if (!period.limit_date) return false;
    const limitDate = new Date(period.limit_date);
    const threeMonthsFromNow = addMonths(new Date(), 3);
    return limitDate <= threeMonthsFromNow && period.days_available > 0;
  });

  if (expiringPeriods.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Atenção</AlertTitle>
      <AlertDescription>
        Você tem {expiringPeriods.length} período(s) de {isPJ ? 'descanso' : 'férias'} próximo(s) do vencimento.
        Por favor, programe seu {isPJ ? 'descanso' : 'férias'} em breve.
      </AlertDescription>
    </Alert>
  );
};

export default ExpiringPeriodsAlert;
