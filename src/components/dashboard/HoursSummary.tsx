
import type { MonthlyData, HoursBreakdown } from "@/types/dashboard";

interface HoursSummaryProps {
  currentMonthData: MonthlyData;
  hoursBreakdown: HoursBreakdown;
}

const HoursSummary = ({ currentMonthData, hoursBreakdown }: HoursSummaryProps) => {
  const hoursBalance = currentMonthData.hoursWorked - currentMonthData.capacit;
  const nonProjectHours = currentMonthData.hoursWorked - currentMonthData.projectHours;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Horas Realizadas</h3>
          <p className="text-2xl font-bold">{currentMonthData.hoursWorked}h</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Horas em Projetos</h3>
          <p className="text-2xl font-bold">{currentMonthData.projectHours}h</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Saldo de Horas</h3>
          <p className={`text-2xl font-bold ${hoursBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {hoursBalance > 0 ? '+' : ''}{hoursBalance}h
          </p>
        </div>
      </div>

      {nonProjectHours > 0 && (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Detalhamento de Horas Não-Projeto</h3>
          <div className="space-y-2">
            {hoursBreakdown.internalProjects > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Projetos Internos</span>
                <span className="font-medium">{hoursBreakdown.internalProjects}h</span>
              </div>
            )}
            {hoursBreakdown.vacation > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Férias</span>
                <span className="font-medium">{hoursBreakdown.vacation}h</span>
              </div>
            )}
            {hoursBreakdown.medicalLeave > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Atestado</span>
                <span className="font-medium">{hoursBreakdown.medicalLeave}h</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Total Não-Projeto</span>
              <span className="font-bold text-accent">{nonProjectHours}h</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoursSummary;
