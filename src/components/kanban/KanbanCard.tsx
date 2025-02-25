
import { AlertCircle, MessageSquare } from "lucide-react";
import { KanbanCard as IKanbanCard } from "@/types/kanban";

interface KanbanCardProps {
  card: IKanbanCard;
  isSelected: boolean;
  onSelect: (card: IKanbanCard) => void;
}

export const KanbanCard = ({
  card,
  isSelected,
  onSelect,
}: KanbanCardProps) => {
  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-sm border transition-all hover:shadow-md cursor-pointer ${
        card.status === "needsCorrection" 
          ? "border-red-200 bg-red-50" 
          : "border-transparent"
      } ${isSelected ? "ring-2 ring-accent" : ""}`}
      onClick={() => onSelect(card)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium">{card.title}</h3>
        {card.status === "needsCorrection" && (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <p><strong>Data:</strong> {new Date(card.timeCorrection.date).toLocaleDateString()}</p>
        <p><strong>Justificativa:</strong> {card.timeCorrection.justification}</p>

        {card.chat && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            <span>{card.chat.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};
