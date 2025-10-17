import { useEffect, useMemo, useState, useCallback } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  createHoliday,
  deleteHoliday,
  listHolidays,
  updateHoliday,
  type Holiday,
  type HolidayInput,
} from "@/lib/holiday-api";

const parseHolidayDate = (value: string): Date => {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const formatHolidayDate = (value: string): string => {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return value;
  }
  const parsed = parseHolidayDate(value);
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const year = parsed.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const sortHolidays = (items: Holiday[]) =>
  [...items].sort(
    (a, b) => parseHolidayDate(a.date).getTime() - parseHolidayDate(b.date).getTime()
  );

type HolidayFormState = {
  name: string;
  date: string;
  isRecurring: boolean;
};

interface HolidayFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: HolidayFormState) => void;
  isSubmitting: boolean;
  initialData: Holiday | null;
}

const HolidayFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialData,
}: HolidayFormDialogProps) => {
  const [formState, setFormState] = useState<HolidayFormState>({
    name: "",
    date: "",
    isRecurring: false,
  });
  const [errors, setErrors] = useState<{ name?: string; date?: string }>({});

  useEffect(() => {
    if (open) {
      setFormState({
        name: initialData?.name ?? "",
        date: initialData ? formatHolidayDate(initialData.date) : "",
        isRecurring: Boolean(initialData?.isRecurring),
      });
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (key: keyof HolidayFormState, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: { name?: string; date?: string } = {};

    if (!formState.name.trim()) {
      nextErrors.name = "Informe o nome do feriado";
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formState.date)) {
      nextErrors.date = "Use o formato dd/mm/aaaa";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      name: formState.name.trim(),
      date: formState.date,
      isRecurring: formState.isRecurring,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar feriado" : "Novo feriado"}</DialogTitle>
          <DialogDescription>
            Informe os dados do feriado. Feriados recorrentes se repetem todos os anos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="holiday-name">Nome</Label>
            <Input
              id="holiday-name"
              value={formState.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Ex: Independência do Brasil"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="holiday-date">Data</Label>
            <Input
              id="holiday-date"
              value={formState.date}
              onChange={(event) => handleChange("date", event.target.value)}
              placeholder="dd/mm/aaaa"
              disabled={isSubmitting}
            />
            {errors.date && <p className="text-xs text-rose-500">{errors.date}</p>}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200/70 px-3 py-2 dark:border-slate-700">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Feriado recorrente
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Mantém o feriado ativo para os próximos anos.
              </span>
            </div>
            <Switch
              checked={formState.isRecurring}
              onCheckedChange={(checked) => handleChange("isRecurring", Boolean(checked))}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const HolidaySettings = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingHoliday, setDeletingHoliday] = useState<Holiday | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const yearOptions = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => currentYear - 3 + index);
  }, [currentYear]);

  const loadHolidays = useCallback(
    async (targetYear: number) => {
      try {
        setIsLoading(true);
        const data = await listHolidays(targetYear);
        setHolidays(sortHolidays(data.map((holiday) => ({
          ...holiday,
          date: formatHolidayDate(holiday.date),
        }))));
      } catch (error) {
        console.error("Erro ao carregar feriados", error);
        toast({
          variant: "destructive",
          title: "Não foi possível carregar os feriados",
          description: "Tente novamente em instantes.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    void loadHolidays(year);
  }, [year, loadHolidays]);

  const handleSubmitHoliday = async (values: HolidayFormState) => {
    setIsSubmitting(true);
    try {
      if (editingHoliday) {
        const updated = await updateHoliday(editingHoliday.id, values);
        setHolidays((prev) =>
          sortHolidays(
            prev.map((holiday) =>
              holiday.id === updated.id
                ? { ...updated, date: formatHolidayDate(updated.date) }
                : holiday
            )
          )
        );
        toast({ title: "Feriado atualizado" });
      } else {
        const created = await createHoliday(values);
        if (parseHolidayDate(created.date).getUTCFullYear() !== year) {
          await loadHolidays(year);
        } else {
          setHolidays((prev) =>
            sortHolidays([...prev, { ...created, date: formatHolidayDate(created.date) }])
          );
        }
        toast({ title: "Feriado cadastrado" });
      }
      setFormOpen(false);
      setEditingHoliday(null);
    } catch (error) {
      console.error("Erro ao salvar feriado", error);
      toast({
        variant: "destructive",
        title: "Não foi possível salvar o feriado",
        description: "Revise as informações e tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHoliday = async () => {
    if (!deletingHoliday) return;
    setIsDeleting(true);
    try {
      await deleteHoliday(deletingHoliday.id);
      setHolidays((prev) => prev.filter((holiday) => holiday.id !== deletingHoliday.id));
      toast({ title: "Feriado removido" });
    } catch (error) {
      console.error("Erro ao remover feriado", error);
      toast({
        variant: "destructive",
        title: "Não foi possível remover",
        description: "Tente novamente em instantes.",
      });
    } finally {
      setIsDeleting(false);
      setDeletingHoliday(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Feriados do ano</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cadastre feriados nacionais, estaduais e corporativos para ajustar automaticamente a capacidade.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Ano de referência
            </Label>
            <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => { setEditingHoliday(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Novo feriado
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/60">
            <TableRow>
              <TableHead className="w-[140px]">Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[160px] text-center">Recorrente</TableHead>
              <TableHead className="w-[120px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Carregando feriados...
                </TableCell>
              </TableRow>
            ) : holidays.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-500">
                  Nenhum feriado cadastrado para {year}.
                </TableCell>
              </TableRow>
            ) : (
              holidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell className="font-medium text-slate-700 dark:text-slate-200">
                    {formatHolidayDate(holiday.date)}
                  </TableCell>
                  <TableCell>{holiday.name}</TableCell>
                  <TableCell className="text-center">
                    {holiday.isRecurring ? (
                      <Badge variant="outline" className="text-emerald-600 dark:text-emerald-300">
                        Recorrente
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Único</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingHoliday(holiday);
                          setFormOpen(true);
                        }}
                        aria-label={`Editar ${holiday.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-500 hover:text-rose-600"
                        onClick={() => setDeletingHoliday(holiday)}
                        aria-label={`Remover ${holiday.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <HolidayFormDialog
        open={formOpen}
        onOpenChange={(next) => {
          setFormOpen(next);
          if (!next) {
            setEditingHoliday(null);
          }
        }}
        initialData={editingHoliday}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitHoliday}
      />

      <AlertDialog open={Boolean(deletingHoliday)} onOpenChange={(open) => !open && setDeletingHoliday(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação remove o feriado selecionado. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHoliday} disabled={isDeleting} className="bg-rose-600 hover:bg-rose-700">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default HolidaySettings;
