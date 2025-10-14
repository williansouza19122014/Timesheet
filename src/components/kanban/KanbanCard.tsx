import { AlertCircle, CalendarClock, MessageSquare, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KanbanCard as IKanbanCard } from "@/types/kanban";

interface KanbanCardProps {
  card: IKanbanCard;
  isSelected: boolean;
  onSelect: (card: IKanbanCard) => void;
}

export const KanbanCard = ({
  card,
  isSelected,
  onSelect,
}: KanbanCardProps) => {
  const isAttention = card.status === "needsCorrection";

  return (
    <div
      className={cn(
        "group rounded-3xl border border-slate-200/70 bg-white/85 p-5 text-sm shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/60",
        isAttention &&
          "border-red-200/70 bg-red-50/80 dark:border-red-500/40 dark:bg-red-500/10",
        isSelected &&
          "border-accent/70 bg-gradient-to-r from-[#7355f6]/20 to-[#a26cff]/15 shadow-xl",
        "cursor-pointer"
      )}
      onClick={() => onSelect(card)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3
            className={cn(
              "text-base font-semibold text-slate-900 transition-colors dark:text-slate-100",
              isSelected && "text-slate-900 dark:text-white"
            )}
          >
            {card.title}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400 transition-colors group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300">
            {card.requesterName}
          </p>
        </div>
        {isAttention && <AlertCircle className="h-5 w-5 text-red-500" />}
      </div>

      <div className="mt-4 space-y-3 text-slate-600 transition-colors dark:text-slate-300">
        {card.timeCorrection?.date && (
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <CalendarClock className="h-4 w-4" />
            {new Date(card.timeCorrection.date).toLocaleDateString()}
          </p>
        )}
        {card.timeCorrection?.justification && (
          <p className="text-sm leading-relaxed">
            <span className="font-medium text-slate-500 dark:text-slate-400">Justificativa:</span>{" "}
            {card.timeCorrection.justification}
          </p>
        )}

        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {card.chat && (
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <MessageSquare className="h-4 w-4" />
            <span>{card.chat.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};
