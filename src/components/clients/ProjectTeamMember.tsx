
import { Pencil, Trash2 } from "lucide-react";

interface ProjectTeamMemberProps {
  name: string;
  email: string;
  startDate: string;
  endDate?: string;
  role: string;
  isLeader?: boolean;
  onRemove: () => void;
  onEdit: () => void;
}

const ProjectTeamMember = ({ 
  name, 
  email, 
  startDate, 
  endDate, 
  role, 
  isLeader,
  onRemove,
  onEdit
}: ProjectTeamMemberProps) => {
  const isActive = !endDate;

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{name}</p>
          {isLeader && (
            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
              Líder
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isActive 
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}>
            {isActive ? "Ativo" : "Inativo"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{email}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(startDate).toLocaleDateString()} 
          {endDate && ` - ${new Date(endDate).toLocaleDateString()}`}
        </p>
        <p className="text-sm">{role}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onRemove}
          className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProjectTeamMember;
