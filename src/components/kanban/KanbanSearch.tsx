import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface KanbanSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export const KanbanSearch = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
}: KanbanSearchProps) => {
  return (
    <div className="flex w-full flex-col gap-3 sm:max-w-xl md:flex-row md:items-center md:justify-end">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Pesquisar por texto, tags ou responsavel..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-11 rounded-xl border-slate-200 bg-white pl-11 text-sm shadow-sm transition-colors focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      {searchQuery && (
        <Button
          variant="ghost"
          onClick={onClearSearch}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <X className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  );
};
