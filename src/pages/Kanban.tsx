
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  status: "requested" | "inAnalysis" | "needsCorrection" | "approved";
  date: Date;
  requesterId: string;
  requesterName: string;
  timeCorrection: {
    date: string;
    times: {
      entrada: string;
      saida: string;
    }[];
    justification: string;
    document?: string;
  };
}

interface KanbanColumn {
  id: "requested" | "inAnalysis" | "needsCorrection" | "approved";
  title: string;
  cards: KanbanCard[];
}

const mockData: KanbanCard[] = [
  {
    id: "1",
    title: "Correção de Horário - João Silva",
    description: "Solicitação de correção de horário do dia 15/04",
    status: "requested",
    date: new Date(),
    requesterId: "1",
    requesterName: "João Silva",
    timeCorrection: {
      date: "2024-04-15",
      times: [
        { entrada: "08:00", saida: "12:00" },
        { entrada: "13:00", saida: "17:00" }
      ],
      justification: "Esqueci de registrar a entrada",
      document: "atestado.pdf"
    }
  },
  {
    id: "2",
    title: "Correção de Horário - Maria Santos",
    description: "Correção necessária no registro do dia 14/04",
    status: "needsCorrection",
    date: new Date(),
    requesterId: "2",
    requesterName: "Maria Santos",
    timeCorrection: {
      date: "2024-04-14",
      times: [
        { entrada: "09:00", saida: "18:00" }
      ],
      justification: "Sistema fora do ar"
    }
  }
];

const initialColumns: KanbanColumn[] = [
  {
    id: "requested",
    title: "Solicitadas",
    cards: mockData.filter(card => card.status === "requested")
  },
  {
    id: "inAnalysis",
    title: "Em Análise pelo Líder",
    cards: mockData.filter(card => card.status === "inAnalysis")
  },
  {
    id: "needsCorrection",
    title: "Correções Necessárias",
    cards: mockData.filter(card => card.status === "needsCorrection")
  },
  {
    id: "approved",
    title: "Histórico de Aprovações",
    cards: mockData.filter(card => card.status === "approved")
  }
];

const Kanban = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const { toast } = useToast();

  const handleAnalyze = (cardId: string) => {
    moveCard(cardId, "requested", "inAnalysis");
    toast({
      title: "Análise iniciada",
      description: "O cartão foi movido para análise"
    });
  };

  const handleApprove = (cardId: string) => {
    moveCard(cardId, "inAnalysis", "approved");
    toast({
      title: "Solicitação aprovada",
      description: "A correção de horário foi aprovada"
    });
  };

  const handleRequestCorrection = (cardId: string) => {
    moveCard(cardId, "inAnalysis", "needsCorrection");
    toast({
      variant: "destructive",
      title: "Correção necessária",
      description: "Uma correção foi solicitada"
    });
  };

  const moveCard = (cardId: string, fromStatus: KanbanColumn["id"], toStatus: KanbanColumn["id"]) => {
    setColumns(prev => {
      const newColumns = [...prev];
      const fromColumn = newColumns.find(col => col.id === fromStatus);
      const toColumn = newColumns.find(col => col.id === toStatus);
      
      if (!fromColumn || !toColumn) return prev;

      const cardIndex = fromColumn.cards.findIndex(card => card.id === cardId);
      if (cardIndex === -1) return prev;

      const [card] = fromColumn.cards.splice(cardIndex, 1);
      toColumn.cards.push({ ...card, status: toStatus });

      return newColumns;
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Fluxo Kanban</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="bg-gray-50 p-4 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium">{column.title}</h2>
              <span className="text-sm text-muted-foreground bg-white px-2 py-1 rounded">
                {column.cards.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {column.cards.map(card => (
                <div
                  key={card.id}
                  className={`bg-white p-4 rounded-lg shadow-sm border ${
                    card.status === "needsCorrection" 
                      ? "border-red-200 bg-red-50" 
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{card.title}</h3>
                    {card.status === "needsCorrection" && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {card.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <p><strong>Data:</strong> {new Date(card.timeCorrection.date).toLocaleDateString()}</p>
                    <div>
                      <strong>Horários:</strong>
                      {card.timeCorrection.times.map((time, index) => (
                        <p key={index} className="ml-2">
                          • {time.entrada} - {time.saida}
                        </p>
                      ))}
                    </div>
                    <p><strong>Justificativa:</strong> {card.timeCorrection.justification}</p>
                    {card.timeCorrection.document && (
                      <p>
                        <strong>Documento:</strong> {card.timeCorrection.document}
                      </p>
                    )}
                  </div>

                  {card.status === "requested" && (
                    <button
                      onClick={() => handleAnalyze(card.id)}
                      className="mt-3 w-full px-3 py-2 bg-accent text-white rounded text-sm hover:bg-accent/90 transition-colors"
                    >
                      Iniciar Análise
                    </button>
                  )}

                  {card.status === "inAnalysis" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleApprove(card.id)}
                        className="flex-1 px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleRequestCorrection(card.id)}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Solicitar Correção
                      </button>
                    </div>
                  )}

                  {card.status === "needsCorrection" && (
                    <div className="mt-3 p-2 bg-red-100 rounded text-sm text-red-700 font-medium">
                      Aguardando correção do colaborador
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Kanban;
