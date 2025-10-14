import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { KanbanCard, KanbanColumn, KanbanFrontendStatus } from "@/types/kanban";
import {
  fetchKanbanBoards,
  moveKanbanCard,
  updateKanbanCard,
  deleteKanbanCard,
  type KanbanApiBoard,
  type KanbanApiCard,
  type KanbanBackendStatus,
} from "@/lib/kanban-api";

const BACKEND_TO_FRONTEND_STATUS: Record<KanbanBackendStatus, KanbanFrontendStatus> = {
  todo: "requested",
  doing: "inAnalysis",
  review: "needsCorrection",
  done: "approved",
};

const FRONTEND_TO_BACKEND_STATUS: Record<KanbanFrontendStatus, KanbanBackendStatus> = {
  requested: "todo",
  inAnalysis: "doing",
  needsCorrection: "review",
  approved: "done",
};

const COLUMN_DEFINITIONS: Array<{ id: KanbanFrontendStatus; title: string }> = [
  { id: "requested", title: "Solicitadas" },
  { id: "inAnalysis", title: "Em Análise pelo Líder" },
  { id: "needsCorrection", title: "Correções Necessárias" },
  { id: "approved", title: "Histórico de Aprovações" },
];

type StatusColumnMap = Record<KanbanBackendStatus, string | undefined>;

type BoardMeta = {
  boardId: string;
  statusToColumn: StatusColumnMap;
};

const buildColumns = (cards: KanbanCard[]): KanbanColumn[] =>
  COLUMN_DEFINITIONS.map(({ id, title }) => ({
    id,
    title,
    cards: cards.filter((card) => card.status === id),
  }));

const deriveStatusToColumn = (board: KanbanApiBoard): StatusColumnMap => {
  const map: StatusColumnMap = {
    todo: undefined,
    doing: undefined,
    review: undefined,
    done: undefined,
  };

  const orderedColumns = [...board.columns].sort((a, b) => a.position - b.position);

  orderedColumns.forEach((column) => {
    column.cards.forEach((card) => {
      if (!map[card.status]) {
        map[card.status] = column.id;
      }
    });
  });

  const fallbackStatuses: KanbanBackendStatus[] = ["todo", "doing", "review", "done"];
  fallbackStatuses.forEach((status, index) => {
    if (!map[status] && orderedColumns[index]) {
      map[status] = orderedColumns[index].id;
    }
  });

  return map;
};

const createFrontendCard = (card: KanbanApiCard): KanbanCard => {
  const frontendStatus = BACKEND_TO_FRONTEND_STATUS[card.status] ?? "requested";
  const primaryAssignee = card.assignees?.[0];

  return {
    id: card.id,
    title: card.title,
    description: card.description ?? "",
    status: frontendStatus,
    date: new Date(card.createdAt),
    requesterId: primaryAssignee,
    requesterName: primaryAssignee ? `Colaborador ${primaryAssignee.slice(-4)}` : "Solicitante",
    priority: card.priority,
    tags: card.tags,
    dueDate: card.dueDate,
    columnId: card.columnId,
    timeCorrection: {
      date: (card.dueDate ?? card.createdAt).slice(0, 10),
      times: [],
      justification: card.description ?? "Sem descrição",
    },
    chat: [],
  };
};

export const useKanban = (cardId: string | null) => {
  const { toast } = useToast();
  const [boardMeta, setBoardMeta] = useState<BoardMeta | null>(null);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = useMemo(() => buildColumns(cards), [cards]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const boards = await fetchKanbanBoards();
      const board = boards[0];
      if (!board) {
        setBoardMeta(null);
        setCards([]);
        return [] as KanbanCard[];
      }

      const statusToColumn = deriveStatusToColumn(board);
      const boardCards = board.columns.flatMap((column) =>
        column.cards.map((card) => createFrontendCard({ ...card, columnId: column.id }))
      );

      setBoardMeta({ boardId: board.id, statusToColumn });
      setCards(boardCards);
      return boardCards;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível carregar o Kanban.";
      setError(message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar Kanban",
        description: message,
      });
      setBoardMeta(null);
      setCards([]);
      return [] as KanbanCard[];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!cardId) {
      setSelectedCard(null);
      return;
    }
    const existing = cards.find((card) => card.id === cardId);
    if (existing) {
      setSelectedCard(existing);
    }
  }, [cardId, cards]);

  useEffect(() => {
    if (!selectedCard) return;
    const updated = cards.find((card) => card.id === selectedCard.id);
    if (updated && updated !== selectedCard) {
      setSelectedCard(updated);
    }
  }, [cards, selectedCard]);

  const ensureColumnForStatus = (status: KanbanFrontendStatus) => {
    if (!boardMeta) {
      throw new Error("Quadro não carregado.");
    }
    const backendStatus = FRONTEND_TO_BACKEND_STATUS[status];
    const targetColumnId = boardMeta.statusToColumn[backendStatus];
    if (!targetColumnId) {
      throw new Error("Coluna destino não encontrada para o status selecionado.");
    }
    return { backendStatus, targetColumnId };
  };

  const moveToStatus = useCallback(
    async (card: KanbanCard, targetStatus: KanbanFrontendStatus) => {
      const { targetColumnId } = ensureColumnForStatus(targetStatus);
      await moveKanbanCard(card.id, { targetColumnId });
      const updatedCards = await refresh();
      return updatedCards.find((item) => item.id === card.id) ?? null;
    },
    [refresh]
  );

  const handleCardSelect = useCallback(
    async (card: KanbanCard) => {
      if (card.status === "requested") {
        try {
          const updated = await moveToStatus(card, "inAnalysis");
          toast({
            title: "Tarefa em análise",
            description: "O cartão foi movido para a coluna de análise.",
          });
          if (updated) {
            setSelectedCard(updated);
          }
        } catch (err) {
          toast({
            variant: "destructive",
            title: "Não foi possível iniciar a análise",
            description: err instanceof Error ? err.message : "Tente novamente mais tarde.",
          });
        }
      } else {
        setSelectedCard(card);
      }
    },
    [moveToStatus, toast]
  );

  const handleApprove = useCallback(
    async (cardId: string) => {
      const card = cards.find((item) => item.id === cardId);
      if (!card) return;
      try {
        await moveToStatus(card, "approved");
        toast({
          title: "Solicitação aprovada",
          description: "O cartão foi movido para o histórico de aprovações.",
        });
        setSelectedCard(null);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Não foi possível aprovar",
          description: err instanceof Error ? err.message : "Tente novamente mais tarde.",
        });
      }
    },
    [cards, moveToStatus, toast]
  );

  const handleRequestCorrection = useCallback(
    async (cardId: string) => {
      const card = cards.find((item) => item.id === cardId);
      if (!card) return;
      try {
        await moveToStatus(card, "needsCorrection");
        toast({
          title: "Correção solicitada",
          description: "O cartão foi movido para a coluna de correções.",
        });
        setSelectedCard(null);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Não foi possível solicitar correção",
          description: err instanceof Error ? err.message : "Tente novamente mais tarde.",
        });
      }
    },
    [cards, moveToStatus, toast]
  );

  const handleRequestReanalysis = useCallback(
    async (cardId: string) => {
      const card = cards.find((item) => item.id === cardId);
      if (!card) return;
      try {
        await moveToStatus(card, "requested");
        toast({
          title: "Reanálise solicitada",
          description: "O cartão retornou para a coluna de solicitações.",
        });
        setSelectedCard(null);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Não foi possível solicitar reanálise",
          description: err instanceof Error ? err.message : "Tente novamente mais tarde.",
        });
      }
    },
    [cards, moveToStatus, toast]
  );

  const handleEditCard = useCallback(
    (cardId: string) => {
      const card = cards.find((item) => item.id === cardId);
      if (card) {
        setEditingCard(card);
        setSelectedCard(null);
      }
    },
    [cards]
  );

  const handleSaveEdit = useCallback(
    async (updatedCard: KanbanCard) => {
      try {
        await updateKanbanCard(updatedCard.id, {
          description: updatedCard.timeCorrection.justification,
          dueDate: updatedCard.timeCorrection.date,
        });
        await refresh();
        setEditingCard(null);
        toast({
          title: "Solicitação atualizada",
          description: "As alterações foram salvas com sucesso.",
        });
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Não foi possível salvar a solicitação",
          description: err instanceof Error ? err.message : "Tente novamente mais tarde.",
        });
      }
    },
    [refresh, toast]
  );

  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      try {
        await deleteKanbanCard(cardId);
        await refresh();
        setSelectedCard(null);
        toast({
          title: "Solicitação removida",
          description: "O cartão foi excluído do quadro.",
        });
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Não foi possível excluir o cartão",
          description: err instanceof Error ? err.message : "Tente novamente mais tarde.",
        });
      }
    },
    [refresh, toast]
  );

  const handleSendMessage = useCallback(
    (message: string) => {
      if (!selectedCard) return;
      const newMessage = {
        id: Date.now().toString(),
        userId: selectedCard.requesterId ?? "currentUser",
        userName: selectedCard.requesterName ?? "Usuário",
        message,
        timestamp: new Date(),
        isLeader: true,
      };

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === selectedCard.id
            ? {
                ...card,
                chat: [...(card.chat ?? []), newMessage],
              }
            : card
        )
      );

      setSelectedCard((prev) =>
        prev
          ? {
              ...prev,
              chat: [...(prev.chat ?? []), newMessage],
            }
          : prev
      );
    },
    [selectedCard]
  );

  return {
    columns,
    cards,
    selectedCard,
    editingCard,
    isLoading,
    error,
    handleCardSelect,
    handleEditCard,
    handleSaveEdit,
    handleDeleteCard,
    handleApprove,
    handleRequestCorrection,
    handleRequestReanalysis,
    handleSendMessage,
    setSelectedCard,
    setEditingCard,
    refresh,
  };
};
