
import { useEffect } from "react";
import { useVacations } from "@/hooks/use-vacations";
import { exportVacationsToCSV } from "@/utils/vacation-export";
import VacationsHeader from "@/components/vacations/VacationsHeader";
import ExpiringPeriodsAlert from "@/components/vacations/ExpiringPeriodsAlert";
import PeriodsTable from "@/components/vacations/PeriodsTable";
import RequestsTable from "@/components/vacations/RequestsTable";

const Vacations = () => {
  const { periods, requests, isLoading, loadVacationData } = useVacations();

  useEffect(() => {
    loadVacationData();
  }, []);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <VacationsHeader 
        periods={periods}
        onExport={() => exportVacationsToCSV(periods, requests)}
        onRequestSuccess={loadVacationData}
      />

      <ExpiringPeriodsAlert periods={periods} />

      <div className="space-y-6">
        <PeriodsTable periods={periods} />
        <RequestsTable requests={requests} />
      </div>
    </div>
  );
};

export default Vacations;
