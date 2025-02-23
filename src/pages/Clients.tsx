
import { useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  projects: Project[];
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      projects: []
    };

    setClients(prev => [...prev, newClient]);
    setShowNewClientForm(false);
    toast({
      title: "Cliente adicionado",
      description: `${newClient.name} foi adicionado com sucesso`
    });
  };

  const handleAddProject = (clientId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: formData.get("projectName") as string,
      description: formData.get("description") as string
    };

    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          projects: [...client.projects, newProject]
        };
      }
      return client;
    }));

    setShowNewProjectForm(null);
    toast({
      title: "Projeto adicionado",
      description: `${newProject.name} foi adicionado com sucesso`
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Clientes</h1>
        <button
          onClick={() => setShowNewClientForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {showNewClientForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">Novo Cliente</h2>
          <form onSubmit={handleAddClient} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                name="name"
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                name="phone"
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewClientForm(false)}
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
      )}

      <div className="space-y-6">
        {clients.map(client => (
          <div key={client.id} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-medium">{client.name}</h2>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
              <button
                onClick={() => setShowNewProjectForm(client.id)}
                className="px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors"
              >
                Novo Projeto
              </button>
            </div>

            {showNewProjectForm === client.id && (
              <div className="border-t border-b py-4 mb-4">
                <h3 className="text-lg font-medium mb-4">Novo Projeto</h3>
                <form onSubmit={(e) => handleAddProject(client.id, e)} className="space-y-4">
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
                      onClick={() => setShowNewProjectForm(null)}
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
            )}

            <div className="space-y-2">
              <h3 className="font-medium">Projetos</h3>
              {client.projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum projeto cadastrado</p>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {client.projects.map(project => (
                    <div key={project.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clients;
