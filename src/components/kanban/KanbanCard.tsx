
import { AlertCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanCard as IKanbanCard } from "@/types/kanban";

interface KanbanCardProps {
  card: IKanbanCard;
  isSelected: boolean;
  onSelect: (card: IKanbanCard) => void;
  onAnalyze: (cardId: string) => void;
  onApprove: (cardId: string) => void;
  onRequestCorrection: (cardId: string) => void;
}

export const KanbanCard = ({
  card,
  isSelected,
  onSelect,
  onAnalyze,
  onApprove,
  onRequestCorrection
}: KanbanCardProps) => {
  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-sm border ${
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

        {card.chat && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            <span>{card.chat.length}</span>
          </div>
        )}
      </div>

      {card.status === "requested" && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAnalyze(card.id);
          }}
          className="mt-3 w-full"
          variant="secondary"
        >
          Iniciar Análise
        </Button>
      )}

      {card.status === "inAnalysis" && (
        <div className="flex gap-2 mt-3">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onApprove(card.id);
            }}
            className="flex-1"
            variant="default"
          >
            Aprovar
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRequestCorrection(card.id);
            }}
            className="flex-1"
            variant="destructive"
          >
            Solicitar Correção
          </Button>
        </div>
      )}
    </div>
  );
};
