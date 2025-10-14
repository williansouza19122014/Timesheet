import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { VacationPeriod, VacationRequest } from "@/types/vacations";
import {
  ensureVacationData,
  createDefaultVacationEntry,
} from "@/utils/vacation-storage";

export const useVacations = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [periods, setPeriods] = useState<VacationPeriod[]>([]);
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVacationData = useCallback(async () => {
    const userId = user?.id;

    if (!userId) {
      setPeriods([]);
      setRequests([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const entry = ensureVacationData(userId, () => createDefaultVacationEntry(userId));
      setPeriods(entry.periods);
      setRequests(entry.requests);
    } catch (error) {
      console.error("Erro ao carregar dados de férias:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user?.id]);

  return {
    periods,
    requests,
    isLoading,
    loadVacationData,
  };
};
