
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkShift {
  id: string;
  name: string;
  periods: {
    start: string;
    end: string;
  }[];
  tolerance: number;
  active: boolean;
}

export function ShiftsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [shifts, setShifts] = useState<WorkShift[]>(() => {
    const savedShifts = localStorage.getItem('workShifts');
    return savedShifts ? JSON.parse(savedShifts) : [];
  });
  const [newShift, setNewShift] = useState<WorkShift>({
    id: '',
    name: '',
    periods: [{ start: '', end: '' }],
    tolerance: 5,
    active: true
  });
  const [showNewShiftForm, setShowNewShiftForm] = useState(false);
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

  const handleToggleShift = (shiftId: string) => {
    const updatedShifts = shifts.map(shift => 
      shift.id === shiftId ? { ...shift, active: !shift.active } : shift
    );
    setShifts(updatedShifts);
    localStorage.setItem('workShifts', JSON.stringify(updatedShifts));
    
    toast({
      title: "Status da escala atualizado",
    });
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
    setShowNewShiftForm(false);
    setNewShift({
      id: '',
      name: '',
      periods: [{ start: '', end: '' }],
      tolerance: 5,
      active: true
    });
    toast({
      title: "Escala cadastrada com sucesso!",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Escalas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>Gerenciar Escalas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewShiftForm(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Nova Escala
          </Button>

          {showNewShiftForm && (
            <div className="space-y-4 border p-4 rounded-lg">
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

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewShiftForm(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveShift}>
                  Salvar Escala
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {shifts.map((shift) => (
              <div key={shift.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{shift.name}</h4>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`shift-${shift.id}`} className="text-sm">
                      {shift.active ? "Ativa" : "Inativa"}
                    </Label>
                    <Switch
                      id={`shift-${shift.id}`}
                      checked={shift.active}
                      onCheckedChange={() => handleToggleShift(shift.id)}
                    />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Tolerância: {shift.tolerance} minutos</p>
                  {shift.periods.map((period, index) => (
                    <p key={index}>
                      Período {index + 1}: {period.start} - {period.end}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
