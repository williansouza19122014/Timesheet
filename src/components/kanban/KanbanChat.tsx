
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/types/kanban";

interface KanbanChatProps {
  messages?: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
}

export const KanbanChat = ({ messages, onSendMessage, onClose }: KanbanChatProps) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <div className="fixed bottom-0 right-0 w-96 bg-white border-l border-t shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Chat</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          Fechar
        </Button>
      </div>

      <ScrollArea className="h-[300px] mb-4">
        <div className="space-y-4">
          {messages?.map((message) => (
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

      <div className="flex gap-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="resize-none"
          rows={2}
        />
        <Button onClick={handleSend}>Enviar</Button>
      </div>
    </div>
  );
};
