
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Client {
  id: string;
  name: string;
  projects: Project[];
}

interface Project {
  id: string;
  name: string;
  description: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select(`
            *,
            projects (
              id,
              name,
              description
            )
          `);

        if (clientsError) throw clientsError;
        setClients(clientsData || []);
      } catch (error: any) {
        console.error('Erro ao carregar clientes:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar clientes",
          description: error.message
        });
      }
    };

    fetchClients();
  }, [toast]);

  return { clients };
};
