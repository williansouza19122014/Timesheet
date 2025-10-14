import { useState } from "react";
import { X, ArrowUpRight, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanCard } from "@/types/kanban";
import { KanbanHoursCard } from "./KanbanHoursCard";
import { KanbanCardDetails } from "./KanbanCardDetails";
import { KanbanChat } from "./KanbanChat";

interface KanbanCardModalProps {
  card: KanbanCard;
  onClose: () => void;
  onApprove: (cardId: string) => void;
  onRequestCorrection: (cardId: string) => void;
  onRequestReanalysis: (cardId: string) => void;
  onSendMessage: (message: string) => void;
  onEdit?: (cardId: string) => void;
  onDelete?: (cardId: string) => void;
}

export const KanbanCardModal = ({
  card,
  onClose,
  onApprove,
  onRequestCorrection,
  onRequestReanalysis,
  onSendMessage,
  onEdit,
  onDelete,
}: KanbanCardModalProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  const handleViewDocument = (documentUrl: string) => {
    window.open(documentUrl, '_blank');
  };

  const parseTime = (time?: string) => {
    if (!time) return null;
    const [hours, minutes] = time.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours + minutes / 60;
  };

  const timePairs = card.timeCorrection?.times ?? [];
  const projects = timePairs.map((time, index) => {
    const start = parseTime(time.entrada);
    const end = parseTime(time.saida);
    const duration = start !== null && end !== null && end > start ? +(end - start).toFixed(2) : 0;
    return {
      name: `Período ${index + 1}`,
      hours: duration,
      details: [
        {
          time: `${time.entrada ?? "--:--"} - ${time.saida ?? "--:--"}`,
          duration,
        },
      ],
    };
  });

  const totalHours = projects.reduce((acc, project) => acc + project.hours, 0);

  const hoursData = {
    date: card.timeCorrection?.date ? new Date(card.timeCorrection.date) : new Date(),
    totalHours,
    projectHours: totalHours,
    difference: 0,
    projects,
  };

  const showEditOptions = card.status === "needsCorrection" && onEdit && onDelete;
  const showApprovalActions = card.status === "inAnalysis";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-[800px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{card.title}</h2>
          <div className="flex items-center gap-2">
            {showEditOptions && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(card.id)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(card.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="flex-1 p-6 border-r overflow-y-auto">
            <div className="space-y-6">
              <KanbanHoursCard hoursData={hoursData} isFlipped={isFlipped} onFlip={() => setIsFlipped(!isFlipped)} />

              <KanbanCardDetails
                card={card}
                onViewDocument={handleViewDocument}
              />

              {showApprovalActions && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => onApprove(card.id)}
                    className="flex-1"
                    variant="default"
                  >
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => onRequestCorrection(card.id)}
                    className="flex-1"
                    variant="destructive"
                  >
                    Solicitar Correção
                  </Button>
                </div>
              )}

              {card.status === "needsCorrection" && (
                <Button
                  onClick={() => onRequestReanalysis(card.id)}
                  className="w-full"
                  variant="outline"
                >
                  <ArrowUpRight className="mr-2" />
                  Solicitar Reanálise
                </Button>
              )}
            </div>
          </div>

          <KanbanChat
            messages={card.chat || []}
            newMessage={newMessage}
            onNewMessageChange={(value) => setNewMessage(value)}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};
