
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/types/kanban";

interface KanbanChatProps {
  messages: ChatMessage[];
  newMessage: string;
  onNewMessageChange: (value: string) => void;
  onSendMessage: () => void;
}

export const KanbanChat = ({
  messages,
  newMessage,
  onNewMessageChange,
  onSendMessage,
}: KanbanChatProps) => {
  return (
    <div className="w-80 flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-medium">Conversas</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
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

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="resize-none"
            rows={2}
          />
          <Button onClick={onSendMessage}>Enviar</Button>
        </div>
      </div>
    </div>
  );
};
