
interface ProjectTeamMemberProps {
  onRemove: () => void;
  name: string;
  role: string;
}

const ProjectTeamMember = ({ onRemove, name, role }: ProjectTeamMemberProps) => {
  return (
    <div className="flex items-center justify-between p-2 border rounded-lg">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
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
