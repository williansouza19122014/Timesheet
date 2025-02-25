
import { useState } from "react";
import { Pencil } from "lucide-react";

interface ProjectTeamMemberProps {
  id: string;
  name: string;
  email: string;
  startDate: string;
  endDate?: string;
  role: string;
  isLeader?: boolean;
  onEdit: (id: string, endDate: string) => void;
}

const ProjectTeamMember = ({ 
  id,
  name, 
  email, 
  startDate, 
  endDate, 
  role, 
  isLeader,
  onEdit
}: ProjectTeamMemberProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newEndDate, setNewEndDate] = useState(endDate || "");
  const isActive = !endDate;

  const handleEdit = () => {
    if (isEditing) {
      onEdit(id, newEndDate);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="p-3 border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isActive 
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}>
            Status: {isActive ? "Ativo" : "Inativo"}
          </span>
          {isLeader && (
            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
              Líder
            </span>
          )}
        </div>
        <button
          onClick={handleEdit}
          className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted-foreground">{email}</div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <span className="text-sm text-muted-foreground">Início:</span>
          <p className="text-sm">{new Date(startDate).toLocaleDateString()}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Fim:</span>
          {isEditing ? (
            <input
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              className="w-full p-1 text-sm border rounded"
            />
          ) : (
            <p className="text-sm">
              {endDate ? new Date(endDate).toLocaleDateString() : "---"}
            </p>
          )}
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Cargo:</span>
          <p className="text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectTeamMember;
