
import { FileText } from "lucide-react";
import { KanbanCard } from "@/types/kanban";

interface KanbanCardDetailsProps {
  card: KanbanCard;
  onViewDocument: (documentUrl: string) => void;
}

export const KanbanCardDetails = ({ card, onViewDocument }: KanbanCardDetailsProps) => {
  const timeCorrection = card.timeCorrection;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <p>
          <strong>Nome do colaborador:</strong> {card.requesterName ?? "Não informado"}
        </p>
        <p>
          <strong>Data:</strong>{" "}
          {timeCorrection?.date ? new Date(timeCorrection.date).toLocaleDateString() : "Não disponível"}
        </p>
      </div>
      
      <div>
        <strong>Horários:</strong>
        {timeCorrection?.times?.length ? (
          timeCorrection.times.map((time, index) => (
            <p key={index} className="ml-2">
              • {time.entrada} - {time.saida}
            </p>
          ))
        ) : (
          <p className="ml-2 text-sm text-muted-foreground">Sem horários registrados.</p>
        )}
      </div>

      <div>
        <strong>Justificativa:</strong>
        <p className="mt-1">{timeCorrection?.justification ?? "Não informado"}</p>
      </div>

      {timeCorrection?.document && (
        <div>
          <strong>Documento:</strong>
          <button
            onClick={() => onViewDocument(timeCorrection.document!)}
            className="ml-2 text-blue-500 hover:text-blue-700 underline inline-flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            {timeCorrection.document}
          </button>
        </div>
      )}
    </div>
  );
};
