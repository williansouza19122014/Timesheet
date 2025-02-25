import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanSearch } from "@/components/kanban/KanbanSearch";
import { KanbanCardModal } from "@/components/kanban/KanbanCardModal";
import { EditKanbanCardModal } from "@/components/kanban/EditKanbanCardModal";
import { useKanban } from "@/hooks/useKanban";
import { mockData } from "@/data/mockKanbanData";

const Kanban = () => {
  const [searchParams] = useSearchParams();
  const cardId = searchParams.get("cardId");
  const [searchQuery, setSearchQuery] = useState("");

  const {
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
  } = useKanban(cardId);

  const filterCards = (query: string) => {
    if (!query.trim()) {
      return mockData;
    }

    const searchTerm = query.toLowerCase();
    return mockData.filter(card => {
      const searchableText = [
        card.title,
        card.description,
        card.requesterName,
        card.timeCorrection.justification,
        ...(card.chat?.map(msg => `${msg.userName} ${msg.message}`) || [])
      ].join(' ').toLowerCase();

      return searchableText.includes(searchTerm);
    });
  };

  useEffect(() => {
    const filteredCards = filterCards(searchQuery);
    // Implementation would go here if we were using real data
  }, [searchQuery]);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-6 mb-8">
        <h1 className="text-4xl font-bold">Fluxo Kanban</h1>
        <KanbanSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            selectedCardId={selectedCard?.id}
            onCardSelect={handleCardSelect}
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
