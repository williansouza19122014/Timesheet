import { useState } from "react";
import { Pencil } from "lucide-react";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    hire_date: string;
    termination_date?: string;
    status: 'active' | 'inactive';
  };
  onEdit: (user: any) => void;
}

const UserCard = ({ user, onEdit }: UserCardProps) => {
  return (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            user.status === 'active'
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}>
            {user.status === 'active' ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <button
          onClick={() => onEdit(user)}
          className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="font-medium">{user.name}</div>
        <div className="text-sm text-muted-foreground">{user.email}</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-sm text-muted-foreground">Admissão:</span>
          <p className="text-sm">{new Date(user.hire_date).toLocaleDateString()}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Demissão:</span>
          <p className="text-sm">
            {user.termination_date ? new Date(user.termination_date).toLocaleDateString() : '---'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
