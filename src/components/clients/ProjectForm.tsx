
import { useState } from "react";
import { Project } from "@/types/clients";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

interface ProjectFormProps {
  onSubmit: (project: Project) => void;
  onCancel: () => void;
  editingProject?: Project;
}

const ProjectForm = ({ onSubmit, onCancel, editingProject }: ProjectFormProps) => {
  const [project, setProject] = useState<Partial<Project>>(editingProject || {
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!project.name) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome do projeto é obrigatório"
      });
      return;
    }

    const newProject: Project = {
      id: editingProject?.id || crypto.randomUUID(),
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      team: editingProject?.team || [],
      previousMembers: editingProject?.previousMembers || [],
      leader: editingProject?.leader,
    };

    onSubmit(newProject);
    toast({
      title: `Projeto ${editingProject ? 'atualizado' : 'adicionado'}`,
      description: `${newProject.name} foi ${editingProject ? 'atualizado' : 'adicionado'} com sucesso`
    });
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium mb-4">{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Projeto *</label>
          <input
            value={project.name}
            onChange={(e) => setProject({ ...project, name: e.target.value })}
            required
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data de Início</label>
            <div className="relative">
              <input
                type="date"
                value={project.startDate}
                onChange={(e) => setProject({ ...project, startDate: e.target.value })}
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
                value={project.endDate}
                onChange={(e) => setProject({ ...project, endDate: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            value={project.description}
            onChange={(e) => setProject({ ...project, description: e.target.value })}
            className="w-full p-2 border rounded-lg"
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            {editingProject ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
