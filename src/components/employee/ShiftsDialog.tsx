import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { listUsers } from "@/lib/users-api";
import { apiFetch } from "@/lib/api-client";

interface ApiScheduleDay {
  dayOfWeek: number;
  enabled?: boolean;
  hours?: number;
}

interface ScheduleDay {
  dayOfWeek: number;
  enabled: boolean;
  hours: number;
}

interface UserOption {
  id: string;
  name: string;
  workSchedule?: { days?: ApiScheduleDay[] };
}

const WEEK_DAYS = [
  { dayOfWeek: 1, label: "Segunda-feira" },
  { dayOfWeek: 2, label: "Terça-feira" },
  { dayOfWeek: 3, label: "Quarta-feira" },
  { dayOfWeek: 4, label: "Quinta-feira" },
  { dayOfWeek: 5, label: "Sexta-feira" },
  { dayOfWeek: 6, label: "Sábado" },
  { dayOfWeek: 0, label: "Domingo" },
];

const ORDER_MAP = new Map<number, number>([
  [1, 0],
  [2, 1],
  [3, 2],
  [4, 3],
  [5, 4],
  [6, 5],
  [0, 6],
]);

const sortSchedule = (days: ScheduleDay[]): ScheduleDay[] =>
  [...days].sort((a, b) => (ORDER_MAP.get(a.dayOfWeek) ?? 0) - (ORDER_MAP.get(b.dayOfWeek) ?? 0));

const DEFAULT_SCHEDULE: ScheduleDay[] = sortSchedule(
  WEEK_DAYS.map((day) => ({
    dayOfWeek: day.dayOfWeek,
    enabled: day.dayOfWeek >= 1 && day.dayOfWeek <= 5,
    hours: day.dayOfWeek >= 1 && day.dayOfWeek <= 5 ? 8 : 0,
  }))
);

const cloneDefaultSchedule = () => DEFAULT_SCHEDULE.map((day) => ({ ...day }));

const buildScheduleFromApi = (days?: ApiScheduleDay[]): ScheduleDay[] => {
  if (!Array.isArray(days) || days.length === 0) {
    return cloneDefaultSchedule();
  }

  const base = new Map(DEFAULT_SCHEDULE.map((day) => [day.dayOfWeek, { ...day }]));

  days.forEach((item) => {
    if (typeof item?.dayOfWeek !== "number") return;
    const existing = base.get(item.dayOfWeek);
    if (!existing) return;
    const enabled = item.enabled !== undefined ? Boolean(item.enabled) : true;
    const rawHours = typeof item.hours === "number" ? item.hours : existing.hours;
    const hours = enabled ? Math.max(0, Math.min(24, Math.round(rawHours * 100) / 100)) : 0;
    base.set(item.dayOfWeek, {
      dayOfWeek: item.dayOfWeek,
      enabled,
      hours,
    });
  });

  return sortSchedule(Array.from(base.values()));
};

const sanitizeForSave = (schedule: ScheduleDay[]): ApiScheduleDay[] =>
  schedule.map((day) => ({
    dayOfWeek: day.dayOfWeek,
    enabled: day.enabled,
    hours: day.enabled ? Math.max(0, Math.min(24, Math.round(day.hours * 100) / 100)) : 0,
  }));

export function ShiftsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [schedule, setSchedule] = useState<ScheduleDay[]>(cloneDefaultSchedule());
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await listUsers({ status: "ACTIVE" });
        const mapped = response.map((user) => ({
          id: user.id,
          name: user.name,
          workSchedule: user.workSchedule,
        }));
        setUsers(mapped);
        if (mapped.length > 0) {
          setSelectedUserId(mapped[0].id);
          setSchedule(buildScheduleFromApi(mapped[0].workSchedule?.days));
        } else {
          setSelectedUserId("");
          setSchedule(cloneDefaultSchedule());
        }
      } catch (error) {
        console.error("Erro ao carregar colaboradores", error);
        toast({
          variant: "destructive",
          title: "Não foi possível carregar as escalas",
          description: "Verifique sua conexão e tente novamente.",
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    void loadUsers();
  }, [isOpen, toast]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId]
  );

  useEffect(() => {
    if (selectedUser) {
      setSchedule(buildScheduleFromApi(selectedUser.workSchedule?.days));
    }
  }, [selectedUser?.id]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    const target = users.find((user) => user.id === userId);
    setSchedule(buildScheduleFromApi(target?.workSchedule?.days));
  };

  const handleToggleDay = (dayOfWeek: number, enabled: boolean) => {
    setSchedule((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        const nextHours = enabled ? (day.hours || 8) : 0;
        return {
          ...day,
          enabled,
          hours: enabled ? Math.max(0, Math.min(24, nextHours)) : 0,
        };
      })
    );
  };

  const handleHoursChange = (dayOfWeek: number, value: string) => {
    const parsed = Number(value);
    setSchedule((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        if (!day.enabled) return day;
        const sanitized = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(24, parsed));
        return {
          ...day,
          hours: Math.round(sanitized * 100) / 100,
        };
      })
    );
  };

  const weeklyTotal = useMemo(
    () => schedule.reduce((total, day) => (day.enabled ? total + day.hours : total), 0),
    [schedule]
  );

  const handleRestoreDefault = () => {
    setSchedule(cloneDefaultSchedule());
  };

  const handleSave = async () => {
    if (!selectedUserId) {
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        workSchedule: { days: sanitizeForSave(schedule) },
      };

      const updated = await apiFetch<{ id: string; workSchedule?: { days?: ApiScheduleDay[] } }>(
        `/api/users/${selectedUserId}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      setUsers((previous) =>
        previous.map((user) =>
          user.id === updated.id
            ? {
                ...user,
                workSchedule: updated.workSchedule,
              }
            : user
        )
      );

      toast({
        title: "Escala atualizada",
        description: "O cronograma de trabalho foi salvo com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar escala", error);
      toast({
        variant: "destructive",
        title: "Não foi possível salvar a escala",
        description: "Verifique as informações e tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Escalas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gerenciar escalas</DialogTitle>
        </DialogHeader>

        {loadingUsers ? (
          <div className="flex items-center justify-center py-10 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando colaboradores...
          </div>
        ) : users.length === 0 ? (
          <p className="py-6 text-sm text-slate-500 dark:text-slate-400">
            Nenhum colaborador ativo disponível para gerenciamento de escala.
          </p>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="schedule-user">Colaborador</Label>
              <Select value={selectedUserId} onValueChange={handleSelectUser}>
                <SelectTrigger id="schedule-user">
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              {sortSchedule(schedule).map((day) => {
                const meta = WEEK_DAYS.find((item) => item.dayOfWeek === day.dayOfWeek);
                if (!meta) return null;

                return (
                  <div
                    key={day.dayOfWeek}
                    className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 rounded-xl border border-slate-200/70 bg-white/90 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {meta.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {day.enabled ? `${day.hours}h previstas` : "Dia não trabalhado"}
                      </p>
                    </div>
                    <Switch
                      checked={day.enabled}
                      onCheckedChange={(checked) => handleToggleDay(day.dayOfWeek, Boolean(checked))}
                      aria-label={`Habilitar ${meta.label}`}
                    />
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`hours-${day.dayOfWeek}`}
                        className="text-xs text-slate-500 dark:text-slate-400"
                      >
                        Horas
                      </Label>
                      <Input
                        id={`hours-${day.dayOfWeek}`}
                        type="number"
                        step="0.5"
                        min="0"
                        max="24"
                        value={day.hours}
                        onChange={(event) => handleHoursChange(day.dayOfWeek, event.target.value)}
                        disabled={!day.enabled}
                        className="w-24"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <span>Total semanal previsto</span>
              <span className="font-semibold">{weeklyTotal.toFixed(1)}h</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" onClick={handleRestoreDefault} disabled={isSaving}>
                Restaurar padrão
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !selectedUserId}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar escala
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
