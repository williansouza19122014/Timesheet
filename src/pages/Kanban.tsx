
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanCardModal } from "@/components/kanban/KanbanCardModal";
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
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (cardId) {
      const card = mockData.find(c => c.id === cardId);
      if (card) setSelectedCard(card);
    }
  }, [cardId]);

  const filterCards = (query: string) => {
    if (!query.trim()) {
      setColumns(initialColumns);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filteredColumns = initialColumns.map(column => ({
      ...column,
      cards: column.cards.filter(card => {
        const searchableText = [
          card.title,
          card.description,
          card.requesterName,
          card.timeCorrection.justification,
          ...(card.chat?.map(msg => `${msg.userName} ${msg.message}`) || [])
        ].join(' ').toLowerCase();

        return searchableText.includes(searchTerm);
      })
    }));

    setColumns(filteredColumns);
  };

  useEffect(() => {
    filterCards(searchQuery);
  }, [searchQuery]);

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
    setSelectedCard(null);
  };

  const handleApprove = (cardId: string) => {
    moveCard(cardId, "inAnalysis", "approved");
    toast({
      title: "Solicitação aprovada",
      description: "A correção de horário foi aprovada"
    });
    setSelectedCard(null);
  };

  const handleRequestCorrection = (cardId: string) => {
    moveCard(cardId, "inAnalysis", "needsCorrection");
    toast({
      variant: "destructive",
      title: "Correção necessária",
      description: "Uma correção foi solicitada"
    });
    setSelectedCard(null);
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
      <div className="flex flex-col gap-6 mb-8">
        <h1 className="text-4xl font-bold">Fluxo Kanban</h1>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por texto, tags ou responsável..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
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
        <KanbanCardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onAnalyze={handleAnalyze}
          onApprove={handleApprove}
          onRequestCorrection={handleRequestCorrection}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
};

export default Kanban;
