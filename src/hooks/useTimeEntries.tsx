
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { startOfMonth } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface TimeEntry {
  entrada1: string;
  saida1: string;
  entrada2: string;
  saida2: string;
  entrada3: string;
  saida3: string;
  totalHoras: string;
  projetos: ProjectEntry[];
}

interface ProjectEntry {
  projeto: string;
  horas: number;
}

interface DatabaseTimeEntry {
  id: string;
  user_id: string;
  entry_date: string;
  entrada1: string | null;
  saida1: string | null;
  entrada2: string | null;
  saida2: string | null;
  entrada3: string | null;
  saida3: string | null;
  total_hours: string;
}

export const useTimeEntries = (selectedMonth: Date) => {
  const [entries, setEntries] = useState<{ [key: string]: TimeEntry }>({});
  const [lastRecordTime, setLastRecordTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTimeEntries = async () => {
      if (!user?.id) return;

      try {
        const startDate = startOfMonth(selectedMonth);
        const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
        
        const { data: timeEntries, error } = await supabase
          .from('time_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('entry_date', startDate.toISOString())
          .lte('entry_date', endDate.toISOString());

        if (error) throw error;

        const formattedEntries: { [key: string]: TimeEntry } = {};
        timeEntries?.forEach((entry: DatabaseTimeEntry) => {
          formattedEntries[entry.entry_date] = {
            entrada1: entry.entrada1 || "",
            saida1: entry.saida1 || "",
            entrada2: entry.entrada2 || "",
            saida2: entry.saida2 || "",
            entrada3: entry.entrada3 || "",
            saida3: entry.saida3 || "",
            totalHoras: entry.total_hours?.split('hours')[0]?.trim() || "00:00",
            projetos: []
          };
        });

        setEntries(formattedEntries);
        console.log("Entradas carregadas:", formattedEntries);
      } catch (error: any) {
        console.error('Erro ao carregar registros:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar registros",
          description: error.message
        });
      }
    };

    fetchTimeEntries();
  }, [selectedMonth, user?.id, toast]);

  const calculateTotalHours = (entry: any): string => {
    let totalMinutes = 0;
    
    const calcPair = (entrada: string, saida: string) => {
      if (entrada && saida) {
        const [entradaHour, entradaMin] = entrada.split(':').map(Number);
        const [saidaHour, saidaMin] = saida.split(':').map(Number);
        return (saidaHour * 60 + saidaMin) - (entradaHour * 60 + entradaMin);
      }
      return 0;
    };
    
    totalMinutes += calcPair(entry.entrada1, entry.saida1);
    totalMinutes += calcPair(entry.entrada2, entry.saida2);
    totalMinutes += calcPair(entry.entrada3, entry.saida3);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleRegisterTime = async () => {
    console.log("Registrando ponto...");
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado"
      });
      return;
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    if (lastRecordTime && (now.getTime() - lastRecordTime.getTime()) < 5 * 60 * 1000) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "É necessário aguardar 5 minutos entre registros"
      });
      return;
    }

    const currentHour = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    try {
      // Buscar registro atual se existir
      const { data: existingEntry, error: fetchError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      let entry = existingEntry || {
        entrada1: null, saida1: null,
        entrada2: null, saida2: null,
        entrada3: null, saida3: null,
        total_hours: "00:00"
      };
      
      let fieldToUpdate = "";
      if (!entry.entrada1) fieldToUpdate = "entrada1";
      else if (!entry.saida1) fieldToUpdate = "saida1";
      else if (!entry.entrada2) fieldToUpdate = "entrada2";
      else if (!entry.saida2) fieldToUpdate = "saida2";
      else if (!entry.entrada3) fieldToUpdate = "entrada3";
      else if (!entry.saida3) fieldToUpdate = "saida3";
      else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Todos os registros do dia já foram feitos"
        });
        return;
      }

      // Atualizar o valor do campo correspondente
      entry = {
        ...entry,
        [fieldToUpdate]: currentHour,
        user_id: user.id,
        entry_date: today
      };
      
      // Calcular horas totais
      const entryForCalc = {
        entrada1: entry.entrada1 || "",
        saida1: entry.saida1 || "",
        entrada2: entry.entrada2 || "",
        saida2: entry.saida2 || "",
        entrada3: entry.entrada3 || "",
        saida3: entry.saida3 || ""
      };
      
      const totalHours = calculateTotalHours(entryForCalc);
      entry.total_hours = totalHours;

      console.log("Enviando dados:", entry);
      
      // Inserir ou atualizar o registro
      const { error } = await supabase
        .from('time_entries')
        .upsert(entry, { onConflict: 'user_id,entry_date' });

      if (error) throw error;

      // Atualizar estado local
      setEntries(prev => ({
        ...prev,
        [today]: {
          entrada1: entry.entrada1 || "",
          saida1: entry.saida1 || "",
          entrada2: entry.entrada2 || "",
          saida2: entry.saida2 || "",
          entrada3: entry.entrada3 || "",
          saida3: entry.saida3 || "",
          totalHoras: totalHours,
          projetos: []
        }
      }));

      setLastRecordTime(now);
      
      toast({
        title: "Horário registrado",
        description: `${fieldToUpdate.replace(/\d+/g, ' ')} - ${currentHour}`
      });
    } catch (error: any) {
      console.error('Erro ao registrar horário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar horário",
        description: error.message
      });
    }
  };

  return {
    entries,
    handleRegisterTime
  };
};
