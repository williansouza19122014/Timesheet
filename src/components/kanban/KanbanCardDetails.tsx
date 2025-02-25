
import { FileText } from "lucide-react";
import { KanbanCard } from "@/types/kanban";

interface KanbanCardDetailsProps {
  card: KanbanCard;
  onViewDocument: (documentUrl: string) => void;
}

export const KanbanCardDetails = ({ card, onViewDocument }: KanbanCardDetailsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <p><strong>Nome do colaborador:</strong> {card.requesterName}</p>
        <p><strong>Data:</strong> {new Date(card.timeCorrection.date).toLocaleDateString()}</p>
      </div>
      
      <div>
        <strong>Horários:</strong>
        {card.timeCorrection.times.map((time, index) => (
          <p key={index} className="ml-2">
            • {time.entrada} - {time.saida}
          </p>
        ))}
      </div>

      <div>
        <strong>Justificativa:</strong>
        <p className="mt-1">{card.timeCorrection.justification}</p>
      </div>

      {card.timeCorrection.document && (
        <div>
          <strong>Documento:</strong>
          <button
            onClick={() => onViewDocument(card.timeCorrection.document!)}
            className="ml-2 text-blue-500 hover:text-blue-700 underline inline-flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            {card.timeCorrection.document}
          </button>
        </div>
      )}
    </div>
  );
};
