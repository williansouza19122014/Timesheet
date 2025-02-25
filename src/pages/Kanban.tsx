
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanChat } from "@/components/kanban/KanbanChat";
import { mockData } from "@/data/mockKanbanData";
import type { KanbanCard, KanbanColumn as IKanbanColumn } from "@/types/kanban";

const initialColumns: IKanbanColumn[] = [
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
  const [searchParams] = useSearchParams();
  const cardId = searchParams.get("cardId");
  const [columns, setColumns] = useState<IKanbanColumn[]>(initialColumns);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (cardId) {
      const card = mockData.find(c => c.id === cardId);
      if (card) setSelectedCard(card);
    }
  }, [cardId]);

  const moveCard = (cardId: string, fromStatus: IKanbanColumn["id"], toStatus: IKanbanColumn["id"]) => {
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

  const handleSendMessage = (message: string) => {
    if (!selectedCard) return;

    const newMessage = {
      id: Date.now().toString(),
      userId: "currentUser",
      userName: "Usuário Atual",
      message,
      timestamp: new Date(),
      isLeader: true
    };

    setSelectedCard(prev => {
      if (!prev) return null;
      return {
        ...prev,
        chat: [...(prev.chat || []), newMessage]
      };
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Fluxo Kanban</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            selectedCardId={selectedCard?.id}
            onCardSelect={setSelectedCard}
            onAnalyze={handleAnalyze}
            onApprove={handleApprove}
            onRequestCorrection={handleRequestCorrection}
          />
        ))}
      </div>

      {selectedCard && (
        <KanbanChat
          messages={selectedCard.chat}
          onSendMessage={handleSendMessage}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
};

export default Kanban;
