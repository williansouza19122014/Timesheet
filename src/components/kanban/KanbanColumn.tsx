
import { ScrollArea } from "@/components/ui/scroll-area";
import { KanbanCard } from "./KanbanCard";
import type { KanbanColumn as IKanbanColumn, KanbanCard as IKanbanCard } from "@/types/kanban";

interface KanbanColumnProps {
  column: IKanbanColumn;
  selectedCardId?: string;
  onCardSelect: (card: IKanbanCard) => void;
  onAnalyze: (cardId: string) => void;
  onApprove: (cardId: string) => void;
  onRequestCorrection: (cardId: string) => void;
}

export const KanbanColumn = ({
  column,
  selectedCardId,
  onCardSelect
}: KanbanColumnProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium">{column.title}</h2>
        <span className="text-sm text-muted-foreground bg-white px-2 py-1 rounded">
          {column.cards.length}
        </span>
      </div>
      
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="space-y-3">
          {column.cards.map(card => (
            <KanbanCard
              key={card.id}
              card={card}
              isSelected={card.id === selectedCardId}
              onSelect={onCardSelect}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
