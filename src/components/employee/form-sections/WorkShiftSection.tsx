/* eslint-disable @typescript-eslint/no-explicit-any */

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface WorkShiftSectionProps {
  selectedShift: string;
  onShiftChange: (value: string) => void;
}

export function WorkShiftSection({ selectedShift, onShiftChange }: WorkShiftSectionProps) {
  const [shifts, setShifts] = useState<any[]>(() => {
    const savedShifts = localStorage.getItem('workShifts');
    return savedShifts ? JSON.parse(savedShifts).filter((shift: any) => shift.active) : [];
  });

  const getShiftTimes = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return null;
    
    return shift.periods.map((period: any, index: number) => (
      <span key={index}>
        {index > 0 && ", "}
        {period.start} - {period.end}
      </span>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="work_shift">Escala de Trabalho *</Label>
        <Select value={selectedShift} onValueChange={onShiftChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a escala" />
          </SelectTrigger>
          <SelectContent>
            {shifts.map((shift) => (
              <SelectItem key={shift.id} value={shift.id}>
                {shift.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedShift && (
          <p className="text-sm text-muted-foreground">
            Horários: {getShiftTimes(selectedShift)}
          </p>
        )}
      </div>
    </div>
  );
}
