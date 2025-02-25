
import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { KanbanCard } from "@/types/kanban";

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
  const [entrada1, setEntrada1] = useState(card.timeCorrection.times[0]?.entrada || "");
  const [saida1, setSaida1] = useState(card.timeCorrection.times[0]?.saida || "");
  const [entrada2, setEntrada2] = useState(card.timeCorrection.times[1]?.entrada || "");
  const [saida2, setSaida2] = useState(card.timeCorrection.times[1]?.saida || "");
  const [entrada3, setEntrada3] = useState(card.timeCorrection.times[2]?.entrada || "");
  const [saida3, setSaida3] = useState(card.timeCorrection.times[2]?.saida || "");
  const [justification, setJustification] = useState(card.timeCorrection.justification);
  const [document, setDocument] = useState<File | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obrigatórios
    if (!date || !justification) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Data e justificativa são campos obrigatórios"
      });
      return;
    }

    // Validar se pelo menos um par de horários foi preenchido
    const hasAtLeastOneTime = (entrada1 && saida1) || 
                             (entrada2 && saida2) || 
                             (entrada3 && saida3);

    if (!hasAtLeastOneTime) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Informe pelo menos um par de horários (entrada e saída)"
      });
      return;
    }

    const times = [
      { entrada: entrada1, saida: saida1 },
      { entrada: entrada2, saida: saida2 },
      { entrada: entrada3, saida: saida3 }
    ].filter(time => time.entrada && time.saida);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Editar Solicitação</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Entrada 1</label>
                <input
                  type="time"
                  value={entrada1}
                  onChange={(e) => setEntrada1(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Saída 1</label>
                <input
                  type="time"
                  value={saida1}
                  onChange={(e) => setSaida1(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Entrada 2</label>
                <input
                  type="time"
                  value={entrada2}
                  onChange={(e) => setEntrada2(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Saída 2</label>
                <input
                  type="time"
                  value={saida2}
                  onChange={(e) => setSaida2(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Entrada 3</label>
                <input
                  type="time"
                  value={entrada3}
                  onChange={(e) => setEntrada3(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Saída 3</label>
                <input
                  type="time"
                  value={saida3}
                  onChange={(e) => setSaida3(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Comprovante (Atestado)</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                onChange={(e) => setDocument(e.target.files?.[0] || null)}
                className="hidden"
                id="document"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="document"
                className="flex items-center gap-2 px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Anexar documento
              </label>
              {(document || card.timeCorrection.document) && (
                <span className="text-sm text-muted-foreground">
                  {document?.name || card.timeCorrection.document}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Justificativa *</label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full p-2 border rounded-lg h-32"
              placeholder="Digite sua justificativa..."
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
