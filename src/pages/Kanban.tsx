
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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

const initialColumns: KanbanColumn[] = [
  {
    id: "requested",
    title: "Solicitadas",
    cards: []
  },
  {
    id: "inAnalysis",
    title: "Em Análise pelo Líder",
    cards: []
  },
  {
    id: "needsCorrection",
    title: "Correções Necessárias",
    cards: []
  },
  {
    id: "approved",
    title: "Histórico de Aprovações",
    cards: []
  }
];

const Kanban = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const { toast } = useToast();

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

    // Notify about status change
    toast({
      title: "Status atualizado",
      description: `Cartão movido para ${columns.find(col => col.id === toStatus)?.title}`
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
            <h2 className="font-medium mb-4 flex items-center justify-between">
              <span>{column.title}</span>
              <span className="text-sm text-muted-foreground">
                ({column.cards.length})
              </span>
            </h2>
            
            <div className="space-y-2">
              {column.cards.map(card => (
                <div
                  key={card.id}
                  className={`bg-white p-4 rounded-lg shadow-sm ${
                    card.status === "needsCorrection" ? "bg-red-50 border-red-200" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{card.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {card.date.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {card.description}
                  </p>

                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Data da Correção:</strong> {card.timeCorrection.date}
                    </p>
                    <div>
                      <strong className="text-sm">Horários:</strong>
                      {card.timeCorrection.times.map((time, index) => (
                        <p key={index} className="text-sm">
                          {index + 1}º: {time.entrada} - {time.saida}
                        </p>
                      ))}
                    </div>
                    {card.timeCorrection.document && (
                      <p className="text-sm">
                        <strong>Documento:</strong> Anexado
                      </p>
                    )}
                  </div>

                  {card.status === "requested" && (
                    <button
                      onClick={() => moveCard(card.id, "requested", "inAnalysis")}
                      className="mt-3 w-full px-3 py-1 bg-accent text-white rounded text-sm hover:bg-accent/90 transition-colors"
                    >
                      Iniciar Análise
                    </button>
                  )}

                  {card.status === "inAnalysis" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => moveCard(card.id, "inAnalysis", "approved")}
                        className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => moveCard(card.id, "inAnalysis", "needsCorrection")}
                        className="flex-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Solicitar Correção
                      </button>
                    </div>
                  )}

                  {card.status === "needsCorrection" && (
                    <div className="mt-3 p-2 bg-red-100 rounded text-sm text-red-700">
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
