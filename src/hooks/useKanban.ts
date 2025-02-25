
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { KanbanCard, KanbanColumn as IKanbanColumn } from "@/types/kanban";
import { mockData } from "@/data/mockKanbanData";

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

export const useKanban = (cardId: string | null) => {
  const [columns, setColumns] = useState<IKanbanColumn[]>(initialColumns);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
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

  const handleCardSelect = (card: KanbanCard) => {
    if (card.status === "requested") {
      moveCard(card.id, "requested", "inAnalysis");
      const updatedCard = { ...card, status: "inAnalysis" as const };
      setSelectedCard(updatedCard);
      toast({
        title: "Tarefa em análise!",
        description: "O cartão foi movido automaticamente para análise"
      });
    } else {
      setSelectedCard(card);
    }
  };

  const handleEditCard = (cardId: string) => {
    const cardToEdit = columns.flatMap(col => col.cards).find(card => card.id === cardId);
    if (cardToEdit) {
      setEditingCard(cardToEdit);
      setSelectedCard(null);
    }
  };

  const handleSaveEdit = (updatedCard: KanbanCard) => {
    setColumns(prev => {
      return prev.map(column => ({
        ...column,
        cards: column.cards.map(card => 
          card.id === updatedCard.id ? updatedCard : card
        )
      }));
    });
    setEditingCard(null);
    toast({
      title: "Solicitação atualizada",
      description: "As alterações foram salvas com sucesso"
    });
  };

  const handleDeleteCard = (cardId: string) => {
    setColumns(prev => {
      return prev.map(column => ({
        ...column,
        cards: column.cards.filter(card => card.id !== cardId)
      }));
    });
    setSelectedCard(null);
    toast({
      title: "Solicitação excluída",
      description: "A solicitação foi removida com sucesso"
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

  const handleRequestReanalysis = (cardId: string) => {
    moveCard(cardId, "needsCorrection", "requested");
    toast({
      title: "Reanálise solicitada",
      description: "O cartão foi movido para a coluna de solicitações"
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

  return {
    columns,
    selectedCard,
    editingCard,
    handleCardSelect,
    handleEditCard,
    handleSaveEdit,
    handleDeleteCard,
    handleAnalyze,
    handleApprove,
    handleRequestCorrection,
    handleRequestReanalysis,
    handleSendMessage,
    setSelectedCard,
    setEditingCard
  };
};
