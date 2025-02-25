
import { useState } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TimeCorrection, KanbanCard } from "@/types/kanban";

interface EditKanbanCardModalProps {
  card: KanbanCard;
  onClose: () => void;
  onSave: (updatedCard: KanbanCard) => void;
}

export const EditKanbanCardModal = ({
  card,
  onClose,
  onSave,
}: EditKanbanCardModalProps) => {
  const [date, setDate] = useState(card.timeCorrection.date);
  const [times, setTimes] = useState(card.timeCorrection.times);
  const [justification, setJustification] = useState(card.timeCorrection.justification);
  const [document, setDocument] = useState<File | null>(null);

  const handleAddTimeSlot = () => {
    setTimes([...times, { entrada: "", saida: "" }]);
  };

  const handleRemoveTimeSlot = (index: number) => {
    setTimes(times.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, field: "entrada" | "saida", value: string) => {
    const newTimes = [...times];
    newTimes[index][field] = value;
    setTimes(newTimes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedCard: KanbanCard = {
      ...card,
      timeCorrection: {
        ...card.timeCorrection,
        date,
        times,
        justification,
        document: document ? document.name : card.timeCorrection.document
      }
    };

    onSave(updatedCard);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-[600px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Editar Solicitação</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <Label>Horários</Label>
              {times.map((time, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      type="time"
                      value={time.entrada}
                      onChange={(e) => handleTimeChange(index, "entrada", e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="time"
                      value={time.saida}
                      onChange={(e) => handleTimeChange(index, "saida", e.target.value)}
                      required
                    />
                  </div>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveTimeSlot(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTimeSlot}
                className="w-full"
              >
                Adicionar Horário
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="justification">Justificativa</Label>
              <Textarea
                id="justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Documento (Opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="document"
                  type="file"
                  onChange={(e) => setDocument(e.target.files?.[0] || null)}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="document"
                  className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent/10 transition-colors cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  Anexar documento
                </label>
                {(document || card.timeCorrection.document) && (
                  <span className="text-sm text-muted-foreground">
                    {document?.name || card.timeCorrection.document}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Alterações
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
