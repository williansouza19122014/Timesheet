
import { Button } from "@/components/ui/button";

interface UserFormActionsProps {
  isEditing: boolean;
  onCancel: () => void;
}

const UserFormActions = ({ isEditing, onCancel }: UserFormActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
      >
        {isEditing ? 'Atualizar' : 'Salvar'}
      </Button>
    </div>
  );
};

export default UserFormActions;
