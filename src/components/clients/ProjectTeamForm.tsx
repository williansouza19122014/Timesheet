
import { useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface ProjectTeamFormProps {
  onAddMember: (member: TeamMember) => void;
}

const ProjectTeamForm = ({ onAddMember }: ProjectTeamFormProps) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMember({
      id: crypto.randomUUID(),
      name,
      role
    });
    setName("");
    setRole("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nome do Membro</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Cargo/Função</label>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
      >
        Adicionar Membro
      </button>
    </form>
  );
};

export default ProjectTeamForm;
