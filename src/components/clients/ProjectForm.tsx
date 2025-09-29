import { useState, type FormEvent } from "react";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/clients";

interface ProjectFormProps {
  onSubmit: (project: Project) => void;
  onCancel: () => void;
  editingProject?: Project;
}

const inputBaseClasses =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

const ProjectForm = ({ onSubmit, onCancel, editingProject }: ProjectFormProps) => {
  const [project, setProject] = useState<Partial<Project>>(editingProject || {
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!project.name) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome do projeto � obrigatório",
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
      title: `Projeto ${editingProject ? "atualizado" : "adicionado"}`,
      description: `${newProject.name} foi ${editingProject ? "atualizado" : "adicionado"} com sucesso`,
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-md backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-slate-900">
          {editingProject ? "Editar Projeto" : "Novo Projeto"}
        </h3>
        <p className="text-sm text-slate-500">Preencha os detalhes essenciais do projeto.</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-600">Nome do Projeto *</label>
            <input
              value={project.name ?? ""}
              onChange={(event) => setProject({ ...project, name: event.target.value })}
              required
              className={inputBaseClasses}
              placeholder="Ex: Implantação ERP"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Data de Início</label>
            <div className="relative">
              <input
                type="date"
                value={project.startDate ?? ""}
                onChange={(event) => setProject({ ...project, startDate: event.target.value })}
                className={`${inputBaseClasses} pr-12`}
              />
              <Calendar className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Data de Fim</label>
            <div className="relative">
              <input
                type="date"
                value={project.endDate ?? ""}
                onChange={(event) => setProject({ ...project, endDate: event.target.value })}
                className={`${inputBaseClasses} pr-12`}
              />
              <Calendar className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-600">Descrição</label>
          <textarea
            value={project.description ?? ""}
            onChange={(event) => setProject({ ...project, description: event.target.value })}
            className={`${inputBaseClasses} min-h-[120px]`}
            placeholder="Descreva o escopo e principais entregas do projeto"
          />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-accent/90"
          >
            {editingProject ? "Atualizar" : "Salvar"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ProjectForm;
