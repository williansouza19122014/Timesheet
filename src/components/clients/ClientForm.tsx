
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types/clients";
import { Calendar } from "lucide-react";

interface ClientFormProps {
  onSubmit: (client: Client) => void;
  onCancel: () => void;
  editingClient?: Client;
}

const ClientForm = ({ onSubmit, onCancel, editingClient }: ClientFormProps) => {
  const [client, setClient] = useState<Partial<Client>>(editingClient || {
    name: "",
    cnpj: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
  });
  const { toast } = useToast();

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);
    value = value.replace(/^(\d{2})(\d)/g, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/g, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/g, '.$1/$2');
    value = value.replace(/(\d{4})(\d)/g, '$1-$2');
    setClient({ ...client, cnpj: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!client.name || !client.cnpj || !client.startDate) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome, CNPJ e Data de Início são obrigatórios",
      });
      return;
    }

    const newClient: Client = {
      id: editingClient?.id || crypto.randomUUID(),
      name: client.name,
      cnpj: client.cnpj,
      startDate: client.startDate,
      endDate: client.endDate,
      projects: editingClient?.projects || []
    };

    onSubmit(newClient);
    toast({
      title: `Cliente ${editingClient ? 'atualizado' : 'adicionado'}`,
      description: `${newClient.name} foi ${editingClient ? 'atualizado' : 'adicionado'} com sucesso`
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <h2 className="text-xl font-medium mb-4">
        {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Cliente *</label>
            <input
              value={client.name}
              onChange={(e) => setClient({ ...client, name: e.target.value })}
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CNPJ *</label>
            <input
              value={client.cnpj}
              onChange={handleCNPJChange}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Data de Início *</label>
              <div className="relative">
                <input
                  type="date"
                  value={client.startDate}
                  onChange={(e) => setClient({ ...client, startDate: e.target.value })}
                  required
                  className="w-full p-2 border rounded-lg"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Data de Fim</label>
              <div className="relative">
                <input
                  type="date"
                  value={client.endDate}
                  onChange={(e) => setClient({ ...client, endDate: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
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
            {editingClient ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;
