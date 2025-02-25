
import { useState } from "react";
import { Calendar } from "lucide-react";
import { TeamMember } from "@/types/clients";

interface ProjectTeamFormProps {
  onAddMember: (member: TeamMember) => void;
  hasLeader?: boolean;
}

const ProjectTeamForm = ({ onAddMember, hasLeader }: ProjectTeamFormProps) => {
  const [member, setMember] = useState<Partial<TeamMember>>({
    name: "",
    email: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    role: "",
    isLeader: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!member.name || !member.email || !member.startDate || !member.role) {
      return;
    }

    onAddMember({
      id: crypto.randomUUID(),
      name: member.name,
      email: member.email,
      startDate: member.startDate,
      endDate: member.endDate,
      role: member.role,
      isLeader: member.isLeader,
      isActive: !member.endDate
    });

    setMember({
      name: "",
      email: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      role: "",
      isLeader: false
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <input
            value={member.name}
            onChange={(e) => setMember({ ...member, name: e.target.value })}
            required
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email Institucional *</label>
          <input
            type="email"
            value={member.email}
            onChange={(e) => setMember({ ...member, email: e.target.value })}
            required
            className="w-full p-2 border rounded-lg"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Data de Início *</label>
          <div className="relative">
            <input
              type="date"
              value={member.startDate}
              onChange={(e) => setMember({ ...member, startDate: e.target.value })}
              required
              className="w-full p-2 border rounded-lg"
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data de Fim</label>
          <div className="relative">
            <input
              type="date"
              value={member.endDate}
              onChange={(e) => setMember({ ...member, endDate: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cargo/Função *</label>
          <input
            value={member.role}
            onChange={(e) => setMember({ ...member, role: e.target.value })}
            required
            className="w-full p-2 border rounded-lg"
          />
        </div>
      </div>
      {!hasLeader && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isLeader"
            checked={member.isLeader}
            onChange={(e) => setMember({ ...member, isLeader: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <label htmlFor="isLeader" className="text-sm font-medium">
            Definir como Líder do Projeto
          </label>
        </div>
      )}
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
