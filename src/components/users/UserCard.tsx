import { SystemUser } from "@/types/users";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Building2, Calendar, Shield } from "lucide-react";
import { useAccessControl } from "@/context/access-control-context";

interface UserCardProps {
  user: SystemUser;
  onEdit?: (user: SystemUser) => void;
}

const UserCard = ({ user, onEdit }: UserCardProps) => {
  const { getRoleLabel } = useAccessControl();
  const formatDate = (date: string) => new Date(date).toLocaleDateString("pt-BR");
  const roleLabel = getRoleLabel(user.accessRole);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{user.name}</h3>
            <div className="mt-2 flex items-center gap-2 rounded-full border border-slate-200/60 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-300">
              <Shield className="h-3.5 w-3.5" />
              <span>{roleLabel}</span>
            </div>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.department && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{user.department}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Admissao: {formatDate(user.hire_date)}</span>
              </div>
            </div>
          </div>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
              Editar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
