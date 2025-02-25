
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
  onClearSearch
}: KanbanSearchProps) => {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por texto, tags ou responsável..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      {searchQuery && (
        <Button
          variant="outline"
          onClick={onClearSearch}
        >
          <X className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      )}
    </div>
  );
};
