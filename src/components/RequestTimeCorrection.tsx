import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Clock, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { v4 as uuidv4 } from "uuid";

interface RequestTimeCorrectionProps {
  isOpen: boolean;
  onClose: () => void;
}

const RequestTimeCorrection = ({ isOpen, onClose }: RequestTimeCorrectionProps) => {
  const [date, setDate] = useState("");
  const [entrada1, setEntrada1] = useState("");
  const [saida1, setSaida1] = useState("");
  const [entrada2, setEntrada2] = useState("");
  const [saida2, setSaida2] = useState("");
  const [entrada3, setEntrada3] = useState("");
  const [saida3, setSaida3] = useState("");
  const [justification, setJustification] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  if (!isOpen) return null;

  const createKanbanCard = async (timeCorrection: any) => {
    const cardData = {
      id: uuidv4(),
      title: `Correção de Horário - ${date}`,
      description: justification,
      status: "requested",
      date: new Date(),
      requesterId: user?.id,
      requesterName: user?.email,
      timeCorrection: {
        date,
        times: [
          { entrada: entrada1, saida: saida1 },
          { entrada: entrada2, saida: saida2 },
          { entrada: entrada3, saida: saida3 }
        ].filter(t => t.entrada || t.saida),
        justification,
        document: document?.name
      }
    };

    return cardData;
  };

  const createNotification = async (cardId: string) => {
    const notification = {
      id: uuidv4(),
      title: "Nova solicitação de correção",
      message: `Correção de horário para ${date} enviada para análise`,
      date: new Date(),
      read: false,
      type: "info" as const
    };

    // Aqui você implementaria a lógica para salvar a notificação no banco de dados
    return notification;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado"
      });
      return;
    }

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

    try {
      // Criar cartão Kanban
      const kanbanCard = await createKanbanCard({
        date,
        entrada1,
        saida1,
        entrada2,
        saida2,
        entrada3,
        saida3,
        justification,
        document
      });

      // Criar notificação
      const notification = await createNotification(kanbanCard.id);

      // Aqui você implementaria a lógica para salvar os dados no banco
      
      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação será analisada pelo líder"
      });

      onClose();
    } catch (error: any) {
      console.error('Erro ao enviar solicitação:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar solicitação",
        description: error.message
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Solicitar Correção de Horário</h2>
        
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
              {document && (
                <span className="text-sm text-muted-foreground">
                  {document.name}
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
              Enviar Solicitação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestTimeCorrection;
