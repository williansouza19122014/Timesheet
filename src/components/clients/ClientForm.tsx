import { useState, type ChangeEvent, type FormEvent } from "react";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types/clients";

interface ClientFormProps {
  onSubmit: (client: Client) => void;
  onCancel: () => void;
  editingClient?: Client;
}

const inputBaseClasses =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

const ClientForm = ({ onSubmit, onCancel, editingClient }: ClientFormProps) => {
  const [client, setClient] = useState<Partial<Client>>(editingClient || {
    name: "",
    cnpj: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });
  const { toast } = useToast();

  const handleCNPJChange = (event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\D/g, "");
    if (value.length > 14) value = value.slice(0, 14);
    value = value.replace(/^(\d{2})(\d)/g, "$1.$2");
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/g, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/g, ".$1/$2");
    value = value.replace(/(\d{4})(\d)/g, "$1-$2");
    setClient({ ...client, cnpj: value });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      projects: editingClient?.projects || [],
    };

    onSubmit(newClient);
    toast({
      title: `Cliente ${editingClient ? "atualizado" : "adicionado"}`,
      description: `${newClient.name} foi ${editingClient ? "atualizado" : "adicionado"} com sucesso`,
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-slate-900">
          {editingClient ? "Editar Cliente" : "Novo Cliente"}
        </h2>
        <p className="text-sm text-slate-500">Campos marcados com * são obrigatórios.</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Nome do Cliente *</label>
            <input
              value={client.name ?? ""}
              onChange={(event) => setClient({ ...client, name: event.target.value })}
              required
              className={inputBaseClasses}
              placeholder="Ex: ACME Tecnologia"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">CNPJ *</label>
            <input
              value={client.cnpj ?? ""}
              onChange={handleCNPJChange}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              required
              className={inputBaseClasses}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Data de Início *</label>
            <div className="relative">
              <input
                type="date"
                value={client.startDate ?? ""}
                onChange={(event) => setClient({ ...client, startDate: event.target.value })}
                required
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
                value={client.endDate ?? ""}
                onChange={(event) => setClient({ ...client, endDate: event.target.value })}
                className={`${inputBaseClasses} pr-12`}
              />
              <Calendar className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
            </div>
          </div>
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
            {editingClient ? "Atualizar" : "Salvar"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ClientForm;
