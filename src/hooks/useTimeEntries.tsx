import { useCallback, useEffect, useState } from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  listTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  type TimeEntryApi,
} from "@/lib/time-entries-api";

export interface TimeEntryAllocationState {
  id: string;
  projectId?: string;
  projectName: string;
  hours: number;
}

export interface TimeEntryState {
  id?: string;
  entrada1: string;
  saida1: string;
  entrada2: string;
  saida2: string;
  entrada3: string;
  saida3: string;
  totalHoras: string;
  allocations: TimeEntryAllocationState[];
}

export type TimeEntryMap = Record<string, TimeEntryState>;

export interface ProjectAllocationFormData {
  clientId: string;
  projectId: string;
  startTime: string;
  endTime: string;
}

const mapTimeEntry = (entry: TimeEntryApi): TimeEntryState => ({
  id: entry.id,
  entrada1: entry.entrada1 ?? "",
  saida1: entry.saida1 ?? "",
  entrada2: entry.entrada2 ?? "",
  saida2: entry.saida2 ?? "",
  entrada3: entry.entrada3 ?? "",
  saida3: entry.saida3 ?? "",
  totalHoras: entry.totalHours ?? "00:00",
  allocations: entry.allocations.map((allocation) => ({
    id: allocation.id,
    projectId: allocation.projectId,
    projectName: allocation.projectName ?? allocation.projectId ?? "Projeto",
    hours: allocation.hours,
  })),
});

const EMPTY_ENTRY: TimeEntryState = {
  entrada1: "",
  saida1: "",
  entrada2: "",
  saida2: "",
  entrada3: "",
  saida3: "",
  totalHoras: "00:00",
  allocations: [],
};

const parseHourStringToMinutes = (value?: string) => {
  if (!value) return 0;
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }
  return hours * 60 + minutes;
};

const parseTimeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  return hours * 60 + minutes;
};

const calculateDurationMinutes = (startTime: string, endTime: string) => {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null) {
    return null;
  }
  const diff = end - start;
  if (diff <= 0) {
    return null;
  }
  return diff;
};

const minutesToDecimalHours = (minutes: number) => {
  return Math.round((minutes / 60) * 100) / 100;
};

export const useTimeEntries = (selectedMonth: Date) => {
  const [entries, setEntries] = useState<TimeEntryMap>({});
  const [lastRecordTime, setLastRecordTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadEntries = async () => {
      if (!user?.id) return;
      try {
        const startDate = startOfMonth(selectedMonth).toISOString();
        const endDate = endOfMonth(selectedMonth).toISOString();
        const data = await listTimeEntries({
          userId: user.id,
          startDate,
          endDate,
        });

        const mappedEntries = data.reduce<TimeEntryMap>((acc, entry) => {
          const isoDate = entry.date.split("T")[0];
          acc[isoDate] = mapTimeEntry(entry);
          return acc;
        }, {});

        setEntries(mappedEntries);
      } catch (error) {
        console.error("Erro ao carregar registros de ponto", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar registros",
          description: "Não foi possível carregar os registros de ponto.",
        });
      }
    };

    loadEntries();
  }, [selectedMonth, toast, user?.id]);

  const handleRegisterTime = useCallback(async () => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado",
      });
      return;
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (lastRecordTime && now.getTime() - lastRecordTime.getTime() < 5 * 60 * 1000) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "É necessário aguardar 5 minutos entre registros",
      });
      return;
    }

    const currentHour = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const currentEntry = entries[today] ?? EMPTY_ENTRY;

    const fields = ["entrada1", "saida1", "entrada2", "saida2", "entrada3", "saida3"] as const;
    const fieldToUpdate = fields.find((field) => !currentEntry[field]);

    if (!fieldToUpdate) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Todos os registros do dia já foram feitos",
      });
      return;
    }

    try {
      let updatedEntry: TimeEntryApi;
      if (currentEntry.id) {
        updatedEntry = await updateTimeEntry(currentEntry.id, {
          [fieldToUpdate]: currentHour,
        });
      } else {
        updatedEntry = await createTimeEntry({
          userId: user.id,
          date: today,
          [fieldToUpdate]: currentHour,
        });
      }

      setEntries((prev) => ({
        ...prev,
        [today]: mapTimeEntry(updatedEntry),
      }));

      setLastRecordTime(now);
      toast({
        title: "Horário registrado",
        description: `Campo ${fieldToUpdate.replace(/\d+/g, " ")} atualizado para ${currentHour}`,
      });
    } catch (error) {
      console.error("Erro ao registrar horário", error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar horário",
        description: "Tente novamente mais tarde.",
      });
    }
  }, [entries, lastRecordTime, toast, user?.id]);

  const handleAllocateProject = useCallback(
    async (date: Date, allocation: ProjectAllocationFormData) => {
      if (!user?.id) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Usuário não autenticado",
        });
        return;
      }

      if (!allocation.projectId) {
        toast({
          variant: "destructive",
          title: "Projeto obrigatório",
          description: "Selecione um projeto para alocar horas.",
        });
        return;
      }

      const durationMinutes = calculateDurationMinutes(allocation.startTime, allocation.endTime);

      if (durationMinutes === null) {
        toast({
          variant: "destructive",
          title: "Horário inválido",
          description: "O horário final deve ser maior que o inicial.",
        });
        return;
      }

      const decimalHours = minutesToDecimalHours(durationMinutes);

      if (decimalHours <= 0) {
        toast({
          variant: "destructive",
          title: "Horário inválido",
          description: "Informe um intervalo válido para o projeto.",
        });
        return;
      }

      const dateKey = date.toISOString().split("T")[0];
      const currentEntry = entries[dateKey];

      const totalEntryMinutes = parseHourStringToMinutes(currentEntry?.totalHoras);
      const existingAllocationMinutes =
        currentEntry?.allocations.reduce((acc, allocationEntry) => acc + Math.round(allocationEntry.hours * 60), 0) ??
        0;

      if (totalEntryMinutes > 0 && existingAllocationMinutes + durationMinutes > totalEntryMinutes) {
        toast({
          variant: "destructive",
          title: "Limite excedido",
          description: "As horas alocadas excedem o total registrado para o dia.",
        });
        return;
      }

      const payloadAllocations = [
        ...(currentEntry?.allocations.map((item) => ({
          projectId: item.projectId,
          hours: item.hours,
        })) ?? []),
        {
          projectId: allocation.projectId,
          hours: decimalHours,
        },
      ];

      try {
        let updatedEntry: TimeEntryApi;
        if (currentEntry?.id) {
          updatedEntry = await updateTimeEntry(currentEntry.id, {
            allocations: payloadAllocations,
          });
        } else {
          updatedEntry = await createTimeEntry({
            userId: user.id,
            date: dateKey,
            allocations: payloadAllocations,
          });
        }

        setEntries((prev) => ({
          ...prev,
          [dateKey]: mapTimeEntry(updatedEntry),
        }));

        toast({
          title: "Alocação registrada",
          description: "As horas foram distribuídas para o projeto selecionado.",
        });
      } catch (error) {
        console.error("Erro ao alocar projeto", error);
        toast({
          variant: "destructive",
          title: "Erro ao alocar projeto",
          description: "Tente novamente mais tarde.",
        });
      }
    },
    [entries, toast, user?.id]
  );

  return {
    entries,
    handleRegisterTime,
    handleAllocateProject,
  };
};
