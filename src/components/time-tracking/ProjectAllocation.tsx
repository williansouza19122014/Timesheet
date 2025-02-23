
interface ProjectAllocationProps {
  onAddProject: () => void;
}

const ProjectAllocation = ({ onAddProject }: ProjectAllocationProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Apontamento de Projetos</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Projeto
          </label>
          <select className="w-full p-2 border rounded-lg">
            <option>Projeto A</option>
            <option>Projeto B</option>
            <option>Projeto C</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Horas
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            className="w-full p-2 border rounded-lg"
            placeholder="0.0"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button 
          onClick={onAddProject}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Adicionar Projeto
        </button>
      </div>
    </div>
  );
};

export default ProjectAllocation;
