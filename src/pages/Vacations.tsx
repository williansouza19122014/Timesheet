
import { useEffect } from "react";
import { useVacations } from "@/hooks/use-vacations";
import { exportVacationsToCSV } from "@/utils/vacation-export";
import VacationsHeader from "@/components/vacations/VacationsHeader";
import ExpiringPeriodsAlert from "@/components/vacations/ExpiringPeriodsAlert";
import PeriodsTable from "@/components/vacations/PeriodsTable";
import RequestsTable from "@/components/vacations/RequestsTable";
import { useAuth } from "@/hooks/useAuth";

const Vacations = () => {
  const { periods, requests, isLoading, loadVacationData } = useVacations();
  const { user } = useAuth();
  const isPJ = periods[0]?.contract_type === 'PJ';

  useEffect(() => {
    loadVacationData();
  }, [loadVacationData]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <VacationsHeader 
        periods={periods}
        onExport={() => exportVacationsToCSV(periods, requests)}
        onRequestSuccess={loadVacationData}
        isPJ={isPJ}
      />

      <ExpiringPeriodsAlert periods={periods} isPJ={isPJ} />

      <div className="grid gap-6 lg:grid-cols-2">
        <PeriodsTable periods={periods} isPJ={isPJ} />
        <RequestsTable requests={requests} isPJ={isPJ} />
      </div>
    </div>
  );
};

export default Vacations;
