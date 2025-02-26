
import { SystemUser } from "@/types/users";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Building2, Calendar } from "lucide-react";

interface UserCardProps {
  user: SystemUser;
  onEdit: (user: SystemUser) => void;
}

const UserCard = ({ user, onEdit }: UserCardProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{user.name}</h3>
            <div className="space-y-2 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.department && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{user.department}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Admissão: {formatDate(user.hire_date)}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
          >
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
