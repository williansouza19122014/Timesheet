
import { Project } from "@/types/clients";
import { useToast } from "@/hooks/use-toast";

interface ProjectFormProps {
  onSubmit: (project: Project) => void;
  onCancel: () => void;
}

const ProjectForm = ({ onSubmit, onCancel }: ProjectFormProps) => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: formData.get("projectName") as string,
      description: formData.get("description") as string,
      team: []
    };

    onSubmit(newProject);
    toast({
      title: "Projeto adicionado",
      description: `${newProject.name} foi adicionado com sucesso`
    });
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium mb-4">Novo Projeto</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Projeto</label>
          <input
            name="projectName"
            required
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            name="description"
            required
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
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
