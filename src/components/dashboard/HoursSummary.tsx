import { cn } from "@/lib/utils";
import type { MonthlyData, HoursBreakdown } from "@/types/dashboard";

interface HoursSummaryProps {
  currentMonthData: MonthlyData;
  hoursBreakdown: HoursBreakdown;
  className?: string;
}

const HoursSummary = ({ currentMonthData, hoursBreakdown, className }: HoursSummaryProps) => {
  const hoursBalance = currentMonthData.hoursWorked - currentMonthData.capacit;
  const nonProjectHours = Math.max(currentMonthData.hoursWorked - currentMonthData.projectHours, 0);

  const summaryCards = [
    {
      label: "Horas realizadas",
      value: `${currentMonthData.hoursWorked}h`,
    },
    {
      label: "Horas em projetos",
      value: `${currentMonthData.projectHours}h`,
    },
    {
      label: "Saldo de horas",
      value: `${hoursBalance > 0 ? "+" : ""}${hoursBalance}h`,
      valueClass: hoursBalance >= 0 ? "text-green-500" : "text-red-500",
    },
  ];

  const breakdownItems = [
    {
      label: "Projetos internos",
      value: hoursBreakdown.internalProjects,
    },
    {
      label: "Férias",
      value: hoursBreakdown.vacation,
    },
    {
      label: "Atestado",
      value: hoursBreakdown.medicalLeave,
    },
  ].filter((item) => item.value > 0);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200/60 bg-slate-50/80 p-4 text-center sm:text-left dark:border-slate-700 dark:bg-slate-800/50"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {card.label}
            </span>
            <p
              className={cn(
                "mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100",
                card.valueClass
              )}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {nonProjectHours > 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Detalhamento de horas sem projeto
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {breakdownItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{item.value}h</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm dark:border-slate-700">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Total de horas sem projeto apontado</span>
              <span className="font-bold text-accent">{nonProjectHours}h</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoursSummary;
