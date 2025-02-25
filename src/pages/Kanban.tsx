import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  status: "requested" | "inAnalysis" | "needsCorrection" | "approved";
  date: Date;
  requesterId: string;
  requesterName: string;
  timeCorrection: {
    date: string;
    times: {
      entrada: string;
      saida: string;
    }[];
    justification: string;
    document?: string;
  };
  chat?: ChatMessage[];
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  isLeader: boolean;
}

interface KanbanColumn {
  id: "requested" | "inAnalysis" | "needsCorrection" | "approved";
  title: string;
  cards: KanbanCard[];
}

const mockData: KanbanCard[] = [
  {
    id: "1",
    title: "Correção de Horário - João Silva",
    description: "Solicitação de correção de horário do dia 15/04",
    status: "requested",
    date: new Date(),
    requesterId: "1",
    requesterName: "João Silva",
    timeCorrection: {
      date: "2024-04-15",
      times: [
        { entrada: "08:00", saida: "12:00" },
        { entrada: "13:00", saida: "17:00" }
      ],
      justification: "Esqueci de registrar a entrada",
      document: "atestado.pdf"
    },
    chat: [
      {
        id: "1",
        userId: "1",
        userName: "João Silva",
        message: "Solicito a correção do horário conforme justificativa anexa.",
        timestamp: new Date(2024, 3, 15, 9, 30),
        isLeader: false
      },
      {
        id: "2",
        userId: "2",
        userName: "Maria Santos",
        message: "Verificarei a solicitação em breve.",
        timestamp: new Date(2024, 3, 15, 10, 0),
        isLeader: true
      }
    ]
  },
  {
    id: "2",
    title: "Correção de Horário - Maria Santos",
    description: "Correção necessária no registro do dia 14/04",
    status: "needsCorrection",
    date: new Date(),
    requesterId: "2",
    requesterName: "Maria Santos",
    timeCorrection: {
      date: "2024-04-14",
      times: [
        { entrada: "09:00", saida: "18:00" }
      ],
      justification: "Sistema fora do ar"
    }
  }
];

const initialColumns: KanbanColumn[] = [
  {
    id: "requested",
    title: "Solicitadas",
    cards: mockData.filter(card => card.status === "requested")
  },
  {
    id: "inAnalysis",
    title: "Em Análise pelo Líder",
    cards: mockData.filter(card => card.status === "inAnalysis")
  },
  {
    id: "needsCorrection",
    title: "Correções Necessárias",
    cards: mockData.filter(card => card.status === "needsCorrection")
  },
  {
    id: "approved",
    title: "Histórico de Aprovações",
    cards: mockData.filter(card => card.status === "approved")
  }
];

const Kanban = () => {
  const [searchParams] = useSearchParams();
  const cardId = searchParams.get("cardId");
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (cardId) {
      const card = mockData.find(c => c.id === cardId);
      if (card) setSelectedCard(card);
    }
  }, [cardId]);

  const handleAnalyze = (cardId: string) => {
    moveCard(cardId, "requested", "inAnalysis");
    toast({
      title: "Análise iniciada",
      description: "O cartão foi movido para análise"
    });
  };

  const handleApprove = (cardId: string) => {
    moveCard(cardId, "inAnalysis", "approved");
    toast({
      title: "Solicitação aprovada",
      description: "A correção de horário foi aprovada"
    });
  };

  const handleRequestCorrection = (cardId: string) => {
    moveCard(cardId, "inAnalysis", "needsCorrection");
    toast({
      variant: "destructive",
      title: "Correção necessária",
      description: "Uma correção foi solicitada"
    });
  };

  const moveCard = (cardId: string, fromStatus: KanbanColumn["id"], toStatus: KanbanColumn["id"]) => {
    setColumns(prev => {
      const newColumns = [...prev];
      const fromColumn = newColumns.find(col => col.id === fromStatus);
      const toColumn = newColumns.find(col => col.id === toStatus);
      
      if (!fromColumn || !toColumn) return prev;

      const cardIndex = fromColumn.cards.findIndex(card => card.id === cardId);
      if (cardIndex === -1) return prev;

      const [card] = fromColumn.cards.splice(cardIndex, 1);
      toColumn.cards.push({ ...card, status: toStatus });

      return newColumns;
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedCard) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: "currentUser",
      userName: "Usuário Atual",
      message: newMessage,
      timestamp: new Date(),
      isLeader: true
    };

    setSelectedCard(prev => {
      if (!prev) return null;
      return {
        ...prev,
        chat: [...(prev.chat || []), message]
      };
    });

    setNewMessage("");
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Fluxo Kanban</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="bg-gray-50 p-4 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium">{column.title}</h2>
              <span className="text-sm text-muted-foreground bg-white px-2 py-1 rounded">
                {column.cards.length}
              </span>
            </div>
            
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-3">
                {column.cards.map(card => (
                  <div
                    key={card.id}
                    className={`bg-white p-4 rounded-lg shadow-sm border ${
                      card.status === "needsCorrection" 
                        ? "border-red-200 bg-red-50" 
                        : "border-transparent"
                    } ${card.id === selectedCard?.id ? "ring-2 ring-accent" : ""}`}
                    onClick={() => setSelectedCard(card)}
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
                        onClick={() => handleAnalyze(card.id)}
                        className="mt-3 w-full"
                        variant="secondary"
                      >
                        Iniciar Análise
                      </Button>
                    )}

                    {card.status === "inAnalysis" && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          onClick={() => handleApprove(card.id)}
                          className="flex-1"
                          variant="default"
                        >
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => handleRequestCorrection(card.id)}
                          className="flex-1"
                          variant="destructive"
                        >
                          Solicitar Correção
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>

      {selectedCard && (
        <div className="fixed bottom-0 right-0 w-96 bg-white border-l border-t shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Chat</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCard(null)}
            >
              Fechar
            </Button>
          </div>

          <ScrollArea className="h-[300px] mb-4">
            <div className="space-y-4">
              {selectedCard.chat?.map((message) => (
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
            <Button onClick={handleSendMessage}>Enviar</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kanban;
