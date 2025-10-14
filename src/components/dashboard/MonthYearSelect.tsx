import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MonthYearSelectProps {
  onMonthChange: (month: number | null) => void;
  onYearChange: (year: number) => void;
  currentMonth: number | null;
  currentYear: number;
  className?: string;
}

const MonthYearSelect = ({
  onMonthChange,
  onYearChange,
  currentMonth,
  currentYear,
  className,
}: MonthYearSelectProps) => {
  const [showAnnualView, setShowAnnualView] = useState(currentMonth === null);

  const months = Array.from({ length: 12 }, (_, index) => ({
    value: index,
    label: format(new Date(2024, index, 1), "MMMM", { locale: ptBR }),
  }));

  const years = Array.from({ length: 5 }, (_, index) => currentYear - 2 + index);

  const handleViewToggle = (checked: boolean) => {
    setShowAnnualView(checked);
    onMonthChange(checked ? null : new Date().getMonth());
  };

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:border-slate-800 dark:bg-slate-900/80",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Label htmlFor="view-toggle" className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Vis?o anual
        </Label>
        <Switch id="view-toggle" checked={showAnnualView} onCheckedChange={handleViewToggle} />
      </div>

      <Select value={currentYear.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Selecione o ano" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!showAnnualView && (
        <Select value={currentMonth?.toString() ?? ""} onValueChange={(value) => onMonthChange(parseInt(value))}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Selecione o m?s" />
          </SelectTrigger>
          <SelectContent>
            {months.map(({ value, label }) => (
              <SelectItem key={value} value={value.toString()}>
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default MonthYearSelect;
