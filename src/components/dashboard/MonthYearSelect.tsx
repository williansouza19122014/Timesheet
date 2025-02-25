
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

interface MonthYearSelectProps {
  onMonthChange: (month: number | null) => void;
  onYearChange: (year: number) => void;
  currentMonth: number | null;
  currentYear: number;
}

const MonthYearSelect = ({
  onMonthChange,
  onYearChange,
  currentMonth,
  currentYear,
}: MonthYearSelectProps) => {
  const [showAnnualView, setShowAnnualView] = useState(currentMonth === null);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2024, i, 1), "MMMM", { locale: ptBR }),
  }));

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handleViewToggle = (checked: boolean) => {
    setShowAnnualView(checked);
    onMonthChange(checked ? null : new Date().getMonth());
  };

  return (
    <div className="flex items-center gap-6 mb-6">
      <div className="flex items-center gap-2">
        <Label htmlFor="view-toggle">Visão Anual</Label>
        <Switch
          id="view-toggle"
          checked={showAnnualView}
          onCheckedChange={handleViewToggle}
        />
      </div>

      <Select
        value={currentYear.toString()}
        onValueChange={(value) => onYearChange(parseInt(value))}
      >
        <SelectTrigger className="w-[180px]">
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
        <Select
          value={currentMonth?.toString() ?? ""}
          onValueChange={(value) => onMonthChange(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            {months.map(({ value, label }) => (
              <SelectItem key={value} value={value.toString()}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default MonthYearSelect;
