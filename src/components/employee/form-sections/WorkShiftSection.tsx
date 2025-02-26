
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WorkShift {
  id: string;
  name: string;
  periods: {
    start: string;
    end: string;
  }[];
  tolerance: number;
}

interface WorkShiftSectionProps {
  selectedShift: string;
  onShiftChange: (value: string) => void;
}

export function WorkShiftSection({ selectedShift, onShiftChange }: WorkShiftSectionProps) {
  const [shifts, setShifts] = useState<WorkShift[]>(() => {
    const savedShifts = localStorage.getItem('workShifts');
    return savedShifts ? JSON.parse(savedShifts) : [];
  });
  const [isOpen, setIsOpen] = useState(false);
  const [newShift, setNewShift] = useState<WorkShift>({
    id: '',
    name: '',
    periods: [{ start: '', end: '' }],
    tolerance: 5
  });
  const { toast } = useToast();

  const handleAddPeriod = () => {
    setNewShift(prev => ({
      ...prev,
      periods: [...prev.periods, { start: '', end: '' }]
    }));
  };

  const handlePeriodChange = (index: number, field: 'start' | 'end', value: string) => {
    setNewShift(prev => ({
      ...prev,
      periods: prev.periods.map((period, i) => 
        i === index ? { ...period, [field]: value } : period
      )
    }));
  };

  const handleSaveShift = () => {
    if (!newShift.name || newShift.periods.some(p => !p.start || !p.end)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }

    const updatedShifts = [
      ...shifts,
      {
        ...newShift,
        id: crypto.randomUUID()
      }
    ];
    setShifts(updatedShifts);
    localStorage.setItem('workShifts', JSON.stringify(updatedShifts));
    setIsOpen(false);
    setNewShift({
      id: '',
      name: '',
      periods: [{ start: '', end: '' }],
      tolerance: 5
    });
    toast({
      title: "Escala cadastrada com sucesso!",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label htmlFor="work_shift">Escala de Trabalho *</Label>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova Escala
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Configurar Nova Escala</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Escala *</Label>
                <Input
                  value={newShift.name}
                  onChange={(e) => setNewShift(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Comercial"
                />
              </div>

              <div className="space-y-2">
                <Label>Tolerância (minutos) *</Label>
                <Input
                  type="number"
                  min="0"
                  max="60"
                  value={newShift.tolerance}
                  onChange={(e) => setNewShift(prev => ({ ...prev, tolerance: Number(e.target.value) }))}
                />
              </div>

              <div className="space-y-4">
                <Label>Períodos *</Label>
                {newShift.periods.map((period, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        type="time"
                        value={period.start}
                        onChange={(e) => handlePeriodChange(index, 'start', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        type="time"
                        value={period.end}
                        onChange={(e) => handlePeriodChange(index, 'end', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddPeriod}>
                  Adicionar Período
                </Button>
              </div>

              <Button onClick={handleSaveShift} className="w-full">
                Salvar Escala
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
    </div>
  );
}
