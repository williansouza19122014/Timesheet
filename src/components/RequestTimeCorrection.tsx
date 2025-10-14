import { useEffect, useMemo, useState } from "react";
import { Clock, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { fetchKanbanBoards, createKanbanCard, type KanbanApiBoard } from "@/lib/kanban-api";

interface RequestTimeCorrectionProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TimePair {
  entrada?: string;
  saida?: string;
}

const overlayClasses =
  "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur";

const panelClasses =
  "relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 shadow-[0_35px_80px_-30px_rgba(15,23,42,0.65)] dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_35px_80px_-30px_rgba(2,6,23,0.75)]";

const fieldClasses =
  "w-full rounded-xl border border-slate-200/70 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-[#7C6CFF] focus:outline-none focus:ring-2 focus:ring-[#7C6CFF]/30 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:ring-[#9E8CFF]/40";

const helperBannerClasses =
  "flex items-center justify-between rounded-2xl border border-dashed border-slate-200/80 bg-white/[0.65] px-4 py-3 text-sm text-slate-600 shadow-inner dark:border-white/15 dark:bg-slate-900/40 dark:text-slate-300";

const secondaryButtonClasses =
  "rounded-lg border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-white/20";

const RequestTimeCorrection = ({ isOpen, onClose }: RequestTimeCorrectionProps) => {
  const [date, setDate] = useState("");
  const [entrada1, setEntrada1] = useState("");
  const [saida1, setSaida1] = useState("");
  const [entrada2, setEntrada2] = useState("");
  const [saida2, setSaida2] = useState("");
  const [entrada3, setEntrada3] = useState("");
  const [saida3, setSaida3] = useState("");
  const [justification, setJustification] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kanbanTarget, setKanbanTarget] = useState<{ columnId: string; board: KanbanApiBoard } | null>(
    null
  );
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadDefaultKanban = async () => {
      if (!isOpen) return;
      try {
        const boards = await fetchKanbanBoards();
        const board = boards[0];
        if (!board || board.columns.length === 0) {
          toast({
            variant: "destructive",
            title: "Kanban não configurado",
            description: "Crie um quadro Kanban antes de registrar correção de ponto.",
          });
          setKanbanTarget(null);
          return;
        }
        const firstColumn = board.columns[0];
        setKanbanTarget({ columnId: firstColumn.id, board });
      } catch (error) {
        console.error("Failed to load Kanban boards", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar Kanban",
          description: "Não foi possível carregar o fluxo de aprovação.",
        });
        setKanbanTarget(null);
      }
    };

    loadDefaultKanban();
  }, [isOpen, toast]);

  const timePairs = useMemo<TimePair[]>(() => {
    return [
      { entrada: entrada1, saida: saida1 },
      { entrada: entrada2, saida: saida2 },
      { entrada: entrada3, saida: saida3 },
    ].filter((pair) => pair.entrada || pair.saida);
  }, [entrada1, saida1, entrada2, saida2, entrada3, saida3]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado.",
      });
      return;
    }

    if (!date || !justification) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Informe a data e escreva uma justificativa.",
      });
      return;
    }

    if (timePairs.length === 0) {
      toast({
        variant: "destructive",
        title: "Horário incompleto",
        description: "Informe ao menos um par de horários (entrada e saída).",
      });
      return;
    }

    if (!kanbanTarget) {
      toast({
        variant: "destructive",
        title: "Configuração incompleta",
        description: "Não foi possível identificar a coluna padrão do fluxo.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createKanbanCard({
        columnId: kanbanTarget.columnId,
        title: `Correcao de ponto - ${date}`,
        description: justification,
        dueDate: date,
        status: "todo",
        assignees: [user.id],
        correction: {
          date,
          justification,
          documentName: document?.name,
          times: timePairs,
        },
      });

      toast({
        title: "Solicitação enviada",
        description: "O ajuste foi enviado ao fluxo de aprovação.",
      });
      onClose();
      setDocument(null);
      setJustification("");
      setEntrada1("");
      setEntrada2("");
      setEntrada3("");
      setSaida1("");
      setSaida2("");
      setSaida3("");
      setDate("");
    } catch (error) {
      console.error("Failed to submit correction", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar solicitação",
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={overlayClasses}>
      <div className={panelClasses}>
        <div className="flex items-start justify-between border-b border-slate-200/70 bg-gradient-to-r from-white/95 to-slate-50/90 px-6 py-5 dark:border-white/10 dark:from-slate-900/75 dark:to-slate-900/40">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Solicitar correção de ponto
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Informe os horarios corretos e descreva o motivo do ajuste.
            </p>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Fechar
          </button>
        </div>

        <form className="space-y-6 p-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Data do registro *
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                className={fieldClasses}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Documento comprobatório
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="document"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) => setDocument(event.target.files?.[0] ?? null)}
                />
                <label
                  htmlFor="document"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#7C6CFF]/60 bg-white/85 px-3 py-2 text-sm font-medium text-[#5E4BFF] shadow-sm transition hover:bg-[#5E4BFF]/10 dark:border-[#9E8CFF]/40 dark:bg-slate-900/60 dark:text-[#C3B6FF]"
                >
                  <Upload className="h-4 w-4" />
                  Anexar arquivo
                </label>
                {document && (
                  <span className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {document.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Entrada 1", value: entrada1, onChange: setEntrada1 },
      { label: "Saída 1", value: saida1, onChange: setSaida1 },
              { label: "Entrada 2", value: entrada2, onChange: setEntrada2 },
      { label: "Saída 2", value: saida2, onChange: setSaida2 },
              { label: "Entrada 3", value: entrada3, onChange: setEntrada3 },
      { label: "Saída 3", value: saida3, onChange: setSaida3 },
            ].map((field) => (
              <div key={field.label} className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {field.label}
                </label>
                <input
                  type="time"
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                  className={fieldClasses}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="justification"
              className="text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              Justificativa *
            </label>
            <textarea
              id="justification"
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
              className={`${fieldClasses} min-h-[120px] resize-none`}
              rows={4}
              placeholder="Descreva o motivo da correção..."
              required
            />
          </div>

          <div className={helperBannerClasses}>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#7C6CFF]" />
              <span>
                A solicitação será encaminhada para o líder responsável e registrada no fluxo Kanban.
              </span>
            </div>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={secondaryButtonClasses}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Fechar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#7C6CFF] px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(124,108,255,0.75)] transition hover:bg-[#6A58FF] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar solicitação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestTimeCorrection;
