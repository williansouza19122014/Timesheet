
interface ProjectTeamMemberProps {
  onRemove: () => void;
  name: string;
  email: string;
  startDate: string;
  endDate: string;
  role: string;
}

const ProjectTeamMember = ({ onRemove, name, email, startDate, endDate, role }: ProjectTeamMemberProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="space-y-1">
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{email}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
        </p>
        <p className="text-sm">{role}</p>
      </div>
      <button
        onClick={onRemove}
        className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
      >
        Remover
      </button>
    </div>
  );
};

export default ProjectTeamMember;
