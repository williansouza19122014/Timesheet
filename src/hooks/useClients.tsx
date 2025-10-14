import { useCallback, useEffect, useState } from "react";
import { Client } from "@/types/clients";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

type ClientResponse = Client & { projects?: unknown[] };

export const useClients = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<ClientResponse[]>("/api/clients");
      setClients(
        (data ?? []).map((client) => ({
          id: client.id,
          name: client.name,
          cnpj: client.cnpj,
          startDate: client.startDate,
          endDate: client.endDate,
          projects: client.projects ?? [],
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar clientes",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    refresh: fetchClients,
  };
};
