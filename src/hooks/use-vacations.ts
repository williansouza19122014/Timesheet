
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { VacationPeriod, VacationRequest } from "@/types/vacations";

export const useVacations = () => {
  const [periods, setPeriods] = useState<VacationPeriod[]>([]);
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadVacationData = async () => {
    try {
      setIsLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) return;

      const [periodsResponse, requestsResponse] = await Promise.all([
        supabase
          .from('vacation_periods')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('start_date', { ascending: false }),
        supabase
          .from('vacation_requests')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false })
      ]);

      if (periodsResponse.error) throw periodsResponse.error;
      if (requestsResponse.error) throw requestsResponse.error;

      setPeriods(periodsResponse.data || []);
      setRequests(requestsResponse.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados de férias:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    periods,
    requests,
    isLoading,
    loadVacationData
  };
};
