
import { useState } from "react";
import { Layout } from "lucide-react";

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  assignee?: string;
  dueDate?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

const initialColumns: KanbanColumn[] = [
  {
    id: "todo",
    title: "A Fazer",
    cards: []
  },
  {
    id: "inProgress",
    title: "Em Andamento",
    cards: []
  },
  {
    id: "review",
    title: "Revisão",
    cards: []
  },
  {
    id: "done",
    title: "Concluído",
    cards: []
  }
];

const Kanban = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);

  const handleDragStart = (e: React.DragEvent, cardId: string, sourceColumnId: string) => {
    e.dataTransfer.setData("cardId", cardId);
    e.dataTransfer.setData("sourceColumnId", sourceColumnId);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    const sourceColumnId = e.dataTransfer.getData("sourceColumnId");

    if (sourceColumnId === targetColumnId) return;

    setColumns(prev => {
      const sourceColumn = prev.find(col => col.id === sourceColumnId);
      const targetColumn = prev.find(col => col.id === targetColumnId);
      
      if (!sourceColumn || !targetColumn) return prev;

      const card = sourceColumn.cards.find(c => c.id === cardId);
      if (!card) return prev;

      return prev.map(col => {
        if (col.id === sourceColumnId) {
          return {
            ...col,
            cards: col.cards.filter(c => c.id !== cardId)
          };
        }
        if (col.id === targetColumnId) {
          return {
            ...col,
            cards: [...col.cards, card]
          };
        }
        return col;
      });
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Kanban</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="bg-gray-50 p-4 rounded-lg"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <h2 className="font-medium mb-4">{column.title}</h2>
            
            <div className="space-y-2">
              {column.cards.map(card => (
                <div
                  key={card.id}
                  className="bg-white p-3 rounded-lg shadow-sm cursor-move"
                  draggable
                  onDragStart={(e) => handleDragStart(e, card.id, column.id)}
                >
                  <h3 className="font-medium">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                  {card.assignee && (
                    <div className="mt-2 text-sm">
                      Responsável: {card.assignee}
                    </div>
                  )}
                  {card.dueDate && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      Prazo: {new Date(card.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Kanban;
