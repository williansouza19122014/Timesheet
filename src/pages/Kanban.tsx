import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanSearch } from "@/components/kanban/KanbanSearch";
import { KanbanCardModal } from "@/components/kanban/KanbanCardModal";
import { EditKanbanCardModal } from "@/components/kanban/EditKanbanCardModal";
import { useKanban } from "@/hooks/useKanban";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const Kanban = () => {
  const [searchParams] = useSearchParams();
  const cardId = searchParams.get("cardId");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    columns,
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
  } = useKanban(cardId);

  const filteredColumns = useMemo(() => {
    if (!searchQuery.trim()) {
      return columns;
    }

    const searchTerm = searchQuery.toLowerCase();

    return columns.map((column) => ({
      ...column,
      cards: column.cards.filter((card) => {
        const textChunks = [
          card.title,
          card.description,
          card.requesterName,
          card.timeCorrection.justification,
          ...(card.tags ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return textChunks.includes(searchTerm);
      }),
    }));
  }, [columns, searchQuery]);

  const hasResults = filteredColumns.some((column) => column.cards.length > 0);

  return (
    <div className="animate-fade-in space-y-5 pb-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Fluxo Kanban</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhe o progresso das solicitacoes e organize as demandas do time.
          </p>
        </div>
        <KanbanSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[600px] rounded-3xl" />
          ))}

        {!isLoading &&
          filteredColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              selectedCardId={selectedCard?.id}
              onCardSelect={handleCardSelect}
            />
          ))}
      </div>

      {!isLoading && !hasResults && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-12 text-center dark:border-slate-700 dark:bg-slate-900/60">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum cartão encontrado para o termo pesquisado.
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar o Kanban</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedCard && (
        <KanbanCardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onApprove={handleApprove}
          onRequestCorrection={handleRequestCorrection}
          onRequestReanalysis={handleRequestReanalysis}
          onSendMessage={handleSendMessage}
          onEdit={handleEditCard}
          onDelete={handleDeleteCard}
        />
      )}

      {editingCard && (
        <EditKanbanCardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default Kanban;
