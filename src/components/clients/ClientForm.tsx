
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types/clients";

interface ClientFormProps {
  onSubmit: (client: Client) => void;
  onCancel: () => void;
}

const ClientForm = ({ onSubmit, onCancel }: ClientFormProps) => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      projects: []
    };

    onSubmit(newClient);
    toast({
      title: "Cliente adicionado",
      description: `${newClient.name} foi adicionado com sucesso`
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <h2 className="text-xl font-medium mb-4">Novo Cliente</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
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

export default ClientForm;
