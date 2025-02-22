
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";

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
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar se todos os campos estão preenchidos
    if (!date || !entrada1 || !saida1 || !entrada2 || !saida2 || !entrada3 || !saida3 || !justification) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Todos os campos são obrigatórios"
      });
      return;
    }

    // Enviar solicitação
    // TODO: Implementar lógica de envio
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação será analisada pelo líder"
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Solicitar Correção de Horário</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium mb-1">Justificativa</label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full p-2 border rounded-lg h-32"
              placeholder="Digite sua justificativa..."
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
