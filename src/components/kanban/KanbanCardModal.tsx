
import { useState } from "react";
import { X, ArrowUpRight, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { KanbanCard, ChatMessage } from "@/types/kanban";

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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  // Simulated hours data for the specific date (replace with real data in production)
  const hoursData = {
    date: new Date(card.timeCorrection.date),
    totalHours: 6, // Example: hours worked on that specific date
    projectHours: 8, // Example: expected hours for that date
    get difference() {
      return this.projectHours - this.totalHours;
    }
  };

  const showEditOptions = card.status === "needsCorrection" && onEdit && onDelete;
  const showApprovalActions = card.status === "inAnalysis";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-[800px] max-h-[90vh] flex flex-col">
        {/* Header */}
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
          {/* Main content */}
          <div className="flex-1 p-6 border-r overflow-y-auto">
            <div className="space-y-6">
              {/* Hours comparison panel */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-medium mb-3">
                  Comparativo de Horas - {hoursData.date.toLocaleDateString()}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Total de horas trabalhadas:</span>
                    <span className="font-medium">{hoursData.totalHours}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total de horas em projetos:</span>
                    <span className="font-medium">{hoursData.projectHours}h</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span>Diferença:</span>
                    <span className={`font-medium ${hoursData.difference > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {hoursData.difference > 0 ? 'Faltam' : 'Excedeu'} {Math.abs(hoursData.difference)}h
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Informações da Solicitação</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Data:</strong> {new Date(card.timeCorrection.date).toLocaleDateString()}</p>
                  <p><strong>Solicitante:</strong> {card.requesterName}</p>
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
                    <p><strong>Documento:</strong> {card.timeCorrection.document}</p>
                  )}
                </div>
              </div>

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

          {/* Chat section */}
          <div className="w-80 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-medium">Conversas</h3>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {card.chat?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex flex-col ${
                      message.isLeader ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.isLeader
                          ? "bg-accent text-white"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm font-medium">{message.userName}</p>
                      <p className="text-sm">{message.message}</p>
                      <span className="text-xs opacity-75">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="resize-none"
                  rows={2}
                />
                <Button onClick={handleSendMessage}>Enviar</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
