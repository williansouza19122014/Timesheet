import { ScrollArea } from "@/components/ui/scroll-area";
import { KanbanCard } from "./KanbanCard";
import type { KanbanColumn as IKanbanColumn, KanbanCard as IKanbanCard } from "@/types/kanban";

interface KanbanColumnProps {
  column: IKanbanColumn;
  selectedCardId?: string;
  onCardSelect: (card: IKanbanCard) => void;
}

export const KanbanColumn = ({
  column,
  selectedCardId,
  onCardSelect,
}: KanbanColumnProps) => {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200/70 bg-gradient-to-b from-white/90 to-white/70 p-5 shadow-lg backdrop-blur-sm dark:border-slate-800/70 dark:from-[#101827] dark:to-[#0f172a]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {column.title}
        </h2>
        <span className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
          {column.cards.length}
        </span>
      </div>

      <ScrollArea className="mt-4 max-h-[540px] pr-1">
        <div className="space-y-3 pb-2">
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              isSelected={card.id === selectedCardId}
              onSelect={onCardSelect}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
