import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Settings2, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  fetchTimeSummary,
  type TimeSummaryRequest,
  type TimeSummaryResponse,
} from "@/lib/reports-api";

type TemplateKey = "timesheet" | "productivity" | "compliance";

interface MetricDefinition {
  id: string;
  label: string;
  defaultSelected?: boolean;
}

interface StatusFilterDefinition {
  id: string;
  label: string;
  defaultSelected?: boolean;
}

interface TemplatePreviewDefinition {
  columns: { key: string; label: string }[];
  rows: Array<Record<string, string>>;
}

interface TemplateDefinition {
  label: string;
  description: string;
  metrics: MetricDefinition[];
  groupBy: string[];
  statusFilters: StatusFilterDefinition[];
  preview: TemplatePreviewDefinition;
}

const rangeOptions = [
  { value: "current_month", label: "Mes atual" },
  { value: "last_month", label: "Mes anterior" },
  { value: "quarter", label: "Ultimos 90 dias" },
  { value: "semester", label: "Ultimos 6 meses" },
  { value: "custom", label: "Periodo personalizado" },
];

const formatOptions = [
  { value: "dashboard", label: "Dashboard interativo" },
  { value: "xlsx", label: "Planilha Excel" },
  { value: "pdf", label: "PDF consolidado" },
];

const templateDefinitions: Record<TemplateKey, TemplateDefinition> = {
  timesheet: {
    label: "Horas e capacidade",
    description: "Analise esforco planejado versus realizado e acompanhe aprovacoes.",
    metrics: [
      { id: "hours_total", label: "Horas registradas", defaultSelected: true },
      { id: "hours_approved", label: "Horas aprovadas", defaultSelected: true },
      { id: "hours_pending", label: "Horas pendentes", defaultSelected: true },
      { id: "capacity_usage", label: "Uso da capacidade" },
      { id: "overtime", label: "Horas extras" },
      { id: "internal_projects", label: "Projetos internos" },
    ],
    groupBy: ["Colaborador", "Cliente", "Projeto", "Dia"],
    statusFilters: [
      { id: "approved", label: "Aprovadas", defaultSelected: true },
      { id: "pending", label: "Pendentes", defaultSelected: true },
      { id: "adjustments", label: "Aguardando ajuste" },
    ],
    preview: {
      columns: [
        { key: "owner", label: "Colaborador" },
        { key: "total", label: "Horas registradas" },
        { key: "approved", label: "Aprovadas" },
        { key: "pending", label: "Pendentes" },
        { key: "overtime", label: "Extras" },
      ],
      rows: [
        { owner: "Ana Souza", total: "168h", approved: "160h", pending: "4h", overtime: "8h" },
        { owner: "Bruno Lima", total: "152h", approved: "152h", pending: "0h", overtime: "2h" },
        { owner: "Carlos Maia", total: "160h", approved: "148h", pending: "6h", overtime: "0h" },
      ],
    },
  },
  productivity: {
    label: "Produtividade e faturamento",
    description: "Monitore utilizacao, faturamento e performance por equipe.",
    metrics: [
      { id: "billing_rate", label: "Horas faturaveis", defaultSelected: true },
      { id: "utilization", label: "Indice de utilizacao", defaultSelected: true },
      { id: "project_margin", label: "Margem por projeto" },
      { id: "rework", label: "Horas retrabalho" },
      { id: "billable_vs_non", label: "Faturavel vs nao faturavel" },
    ],
    groupBy: ["Equipe", "Projeto", "Cliente", "Semana"],
    statusFilters: [
      { id: "billable", label: "Somente faturaveis", defaultSelected: true },
      { id: "non_billable", label: "Incluir nao faturaveis" },
      { id: "over_budget", label: "Projetos acima do orcado" },
    ],
    preview: {
      columns: [
        { key: "scope", label: "Projeto" },
        { key: "billable", label: "Horas faturaveis" },
        { key: "utilization", label: "Utilizacao" },
        { key: "margin", label: "Margem" },
      ],
      rows: [
        { scope: "Portal Cliente X", billable: "420h", utilization: "92%", margin: "18%" },
        { scope: "Aplicativo Mobile Y", billable: "365h", utilization: "88%", margin: "22%" },
        { scope: "Projeto Interno Z", billable: "120h", utilization: "65%", margin: "-" },
      ],
    },
  },
  compliance: {
    label: "Compliance e SLA",
    description: "Controle prazos, aprovacoes e riscos de conformidade.",
    metrics: [
      { id: "sla_on_time", label: "Entregas no prazo", defaultSelected: true },
      { id: "sla_late", label: "Entregas atrasadas", defaultSelected: true },
      { id: "approver_load", label: "Carga dos aprovadores" },
      { id: "missing_approvals", label: "Solicitacoes sem aprovador" },
      { id: "policy_deviation", label: "Desvios de politica" },
    ],
    groupBy: ["Area", "Gestor", "Tipo de solicitacao", "Semana"],
    statusFilters: [
      { id: "on_time", label: "Dentro do SLA", defaultSelected: true },
      { id: "late", label: "Atrasadas", defaultSelected: true },
      { id: "critical", label: "Criticas" },
    ],
    preview: {
      columns: [
        { key: "segment", label: "Area" },
        { key: "onTime", label: "Dentro do SLA" },
        { key: "late", label: "Atrasadas" },
        { key: "critical", label: "Criticas" },
      ],
      rows: [
        { segment: "Desenvolvimento", onTime: "87%", late: "9%", critical: "4%" },
        { segment: "Suporte", onTime: "92%", late: "6%", critical: "2%" },
        { segment: "Consultoria", onTime: "79%", late: "15%", critical: "6%" },
      ],
    },
  },
};

type MetricId = MetricDefinition["id"];

type StatusId = StatusFilterDefinition["id"];

const Reports = () => {
  const { toast } = useToast();
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>("timesheet");
  const [range, setRange] = useState(rangeOptions[0].value);
  const [outputFormat, setOutputFormat] = useState(formatOptions[0].value);
  const [groupBy, setGroupBy] = useState<string>(templateDefinitions.timesheet.groupBy[0]);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricId[]>(
    templateDefinitions.timesheet.metrics
      .filter((metric) => metric.defaultSelected)
      .map((metric) => metric.id)
  );
  const [selectedStatuses, setSelectedStatuses] = useState<StatusId[]>(
    templateDefinitions.timesheet.statusFilters
      .filter((status) => status.defaultSelected)
      .map((status) => status.id)
  );
  const [includeDetails, setIncludeDetails] = useState(true);
  const [comparePreviousPeriod, setComparePreviousPeriod] = useState(false);
  const [highlightAnomalies, setHighlightAnomalies] = useState(true);
  const [autoShare, setAutoShare] = useState(false);
  const [timeSummary, setTimeSummary] = useState<TimeSummaryResponse | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const resolveDateRange = useCallback((): Pick<TimeSummaryRequest, "startDate" | "endDate"> => {
    const today = new Date();
    const endDate = today.toISOString().slice(0, 10);

    const clone = (date: Date) => new Date(date.getTime());
    let start: Date;

    switch (range) {
      case "current_month": {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      }
      case "last_month": {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        start = lastMonth;
        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
        return { startDate: lastMonth.toISOString().slice(0, 10), endDate: lastDay.toISOString().slice(0, 10) };
      }
      case "quarter": {
        start = clone(today);
        start.setDate(start.getDate() - 89);
        break;
      }
      case "semester": {
        start = clone(today);
        start.setDate(start.getDate() - 179);
        break;
      }
      default: {
        start = clone(today);
        start.setDate(start.getDate() - 29);
      }
    }

    return {
      startDate: start.toISOString().slice(0, 10),
      endDate,
    };
  }, [range]);

  const loadTimeSummary = useCallback(async () => {
    if (activeTemplate !== "timesheet") {
      return;
    }
    try {
      setReportsLoading(true);
      setReportsError(null);
      const { startDate, endDate } = resolveDateRange();
      const response = await fetchTimeSummary({
        startDate,
        endDate,
      });
      setTimeSummary(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível carregar os dados de horas.";
      setReportsError(message);
      setTimeSummary(null);
      toast({
        variant: "destructive",
        title: "Erro ao carregar relatórios",
        description: message,
      });
    } finally {
      setReportsLoading(false);
    }
  }, [activeTemplate, resolveDateRange, toast]);

  useEffect(() => {
    const template = templateDefinitions[activeTemplate];
    setGroupBy(template.groupBy[0]);
    setSelectedMetrics(
      template.metrics
        .filter((metric) => metric.defaultSelected)
        .map((metric) => metric.id)
    );
    setSelectedStatuses(
      template.statusFilters
        .filter((status) => status.defaultSelected)
        .map((status) => status.id)
    );
  }, [activeTemplate]);

  useEffect(() => {
    void loadTimeSummary();
  }, [loadTimeSummary]);

  const template = templateDefinitions[activeTemplate];

  const rangeLabel = rangeOptions.find((item) => item.value === range)?.label ?? "";
  const formatLabel = formatOptions.find((item) => item.value === outputFormat)?.label ?? "";

  const previewTable = useMemo(() => template.preview, [template]);

  const toggleMetric = (metricId: MetricId) => {
    setSelectedMetrics((current) =>
      current.includes(metricId)
        ? current.filter((id) => id !== metricId)
        : [...current, metricId]
    );
  };

  const toggleStatus = (statusId: StatusId) => {
    setSelectedStatuses((current) =>
      current.includes(statusId)
        ? current.filter((id) => id !== statusId)
        : [...current, statusId]
    );
  };

  const handleGenerateReport = (mode: "download" | "dashboard") => {
    const actionLabel = mode === "download" ? "download" : "dashboard";

    toast({
      title: "Configuracao salva",
      description: `O relatorio foi preparado para ${actionLabel} com ${selectedMetrics.length} metricas e o periodo "${rangeLabel}".`,
    });
  };

  return (
    <div className="animate-fade-in space-y-8 pb-8">
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-[#f8f9ff] via-white to-[#f1f5ff] p-6 shadow-sm dark:border-slate-800/70 dark:from-[#0f172a] dark:via-[#111827] dark:to-[#1f2937]">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:bg-slate-900/50 dark:text-slate-400">
              Painel de inteligencia
            </span>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Relatorios</h1>
              <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-400">
                Monte relatorios customizados para acompanhar indicadores chave do timesheet.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              className="h-11 gap-2 rounded-xl border-slate-200 bg-white/80 px-5 text-slate-600 shadow-sm transition-colors hover:border-accent/60 hover:text-accent dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
            >
              <Settings2 className="h-4 w-4" />
              Salvar configuracao padrao
            </Button>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-medium text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              Ultima geracao: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTemplate}
        onValueChange={(value) => setActiveTemplate(value as TemplateKey)}
        className="space-y-6"
      >
        <TabsList className="grid w-full gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-900/60 md:grid-cols-3">
          {Object.entries(templateDefinitions).map(([key, definition]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="flex h-full flex-col items-start gap-2 rounded-xl border border-transparent bg-transparent px-4 py-3 text-left text-slate-600 transition data-[state=active]:border-accent/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7355f6]/15 data-[state=active]:to-[#a26cff]/10 data-[state=active]:text-slate-900 dark:text-slate-300 dark:data-[state=active]:from-[#4c43f6]/20 dark:data-[state=active]:to-[#6b67ff]/15 dark:data-[state=active]:text-white"
            >
              <span className="text-sm font-semibold tracking-tight">{definition.label}</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                {definition.description}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTemplate}>
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Card className="border-slate-200/80 bg-white/85 shadow-lg backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-900/60">
              <CardHeader className="pb-4 space-y-1">
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Configuracao do relatorio</CardTitle>
                <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                  Personalize periodo, filtros e metricas que serao utilizadas nesta geracao.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Periodo
                    </span>
                    <Select value={range} onValueChange={setRange}>
                      <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Escolha um periodo" />
                      </SelectTrigger>
                      <SelectContent>
                        {rangeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Agrupar por
                    </span>
                    <Select value={groupBy} onValueChange={setGroupBy}>
                      <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Selecione o agrupamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {template.groupBy.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Formato de entrega
                    </span>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                      <SelectContent>
                        {formatOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </section>

                <section className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Filtros rapidos
                  </span>
                  <div className="grid gap-3 md:grid-cols-3">
                    {template.statusFilters.map((status) => {
                      const isSelected = selectedStatuses.includes(status.id as StatusId);

                      return (
                        <label
                          key={status.id}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm shadow-sm transition-colors backdrop-blur-sm",
                            "border-slate-200/70 bg-white/80 hover:border-accent/40 dark:border-slate-700 dark:bg-slate-900/60",
                            isSelected &&
                              "border-accent/60 bg-gradient-to-r from-[#7355f6]/15 to-[#a26cff]/10 text-slate-900 shadow-md dark:border-[#4c43f6]/50 dark:from-[#4c43f6]/20 dark:to-[#6b67ff]/15 dark:text-white"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleStatus(status.id as StatusId)}
                          />
                          <span className="font-medium">{status.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Metricas do relatorio
                  </span>
                  <div className="grid gap-3 md:grid-cols-2">
                    {template.metrics.map((metric) => {
                      const isSelected = selectedMetrics.includes(metric.id as MetricId);

                      return (
                        <label
                          key={metric.id}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm shadow-sm transition-colors backdrop-blur-sm",
                            "border-slate-200/70 bg-white/80 hover:border-accent/40 dark:border-slate-700 dark:bg-slate-900/60",
                            isSelected &&
                              "border-accent/60 bg-gradient-to-r from-[#7355f6]/15 to-[#a26cff]/10 text-slate-900 shadow-md dark:border-[#4c43f6]/50 dark:from-[#4c43f6]/20 dark:to-[#6b67ff]/15 dark:text-white"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleMetric(metric.id as MetricId)}
                          />
                          <span className="font-medium">{metric.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                  <label
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 shadow-sm transition-colors backdrop-blur-sm",
                      "border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/60",
                      includeDetails &&
                        "border-accent/60 bg-gradient-to-r from-[#7355f6]/15 to-[#a26cff]/10 text-slate-900 shadow-md dark:border-[#4c43f6]/50 dark:from-[#4c43f6]/20 dark:to-[#6b67ff]/15 dark:text-white"
                    )}
                  >
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Incluir detalhamento por registro
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Exibe cada apontamento na exportacao em planilha.
                      </p>
                    </div>
                    <Switch checked={includeDetails} onCheckedChange={setIncludeDetails} />
                  </label>
                  <label
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 shadow-sm transition-colors backdrop-blur-sm",
                      "border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/60",
                      comparePreviousPeriod &&
                        "border-accent/60 bg-gradient-to-r from-[#7355f6]/15 to-[#a26cff]/10 text-slate-900 shadow-md dark:border-[#4c43f6]/50 dark:from-[#4c43f6]/20 dark:to-[#6b67ff]/15 dark:text-white"
                    )}
                  >
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Comparar com periodo anterior
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Adiciona coluna com variacao percentual do periodo anterior.
                      </p>
                    </div>
                    <Switch checked={comparePreviousPeriod} onCheckedChange={setComparePreviousPeriod} />
                  </label>
                  <label className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Destacar anomalias automaticamente
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Marca em destaque desvios relevantes de meta ou SLA.
                      </p>
                    </div>
                    <Switch checked={highlightAnomalies} onCheckedChange={setHighlightAnomalies} />
                  </label>
                  <label
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 shadow-sm transition-colors backdrop-blur-sm",
                      "border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/60",
                      autoShare &&
                        "border-accent/60 bg-gradient-to-r from-[#7355f6]/15 to-[#a26cff]/10 text-slate-900 shadow-md dark:border-[#4c43f6]/50 dark:from-[#4c43f6]/20 dark:to-[#6b67ff]/15 dark:text-white"
                    )}
                  >
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Compartilhar automaticamente com gestores
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Envia o relatorio por e-mail para as liderancas definidas.
                      </p>
                    </div>
                    <Switch checked={autoShare} onCheckedChange={setAutoShare} />
                  </label>
                </section>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-slate-200/60 pt-4 dark:border-slate-800/60 md:flex-row md:justify-end">
                <Button variant="outline" className="gap-2 rounded-xl border-slate-200 bg-white/85 px-5 text-slate-600 shadow-sm transition-colors hover:border-accent/60 hover:text-accent dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                  onClick={() => handleGenerateReport("dashboard")}
                >
                  <BarChart3 className="h-4 w-4" />
                  Atualizar dashboard
                </Button>
                <Button className="gap-2 rounded-xl bg-gradient-to-r from-[#7355f6] to-[#a26cff] px-5 text-white shadow-md transition hover:from-[#6245f6] hover:to-[#8f5cff]" onClick={() => handleGenerateReport("download")}>
                  <Download className="h-4 w-4" />
                  Gerar arquivo
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-slate-200/80 bg-white/85 shadow-lg backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-900/60">
              <CardHeader className="pb-4 space-y-1">
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Resumo e preview</CardTitle>
                <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                  Visualize os principais filtros aplicados antes de exportar o relatorio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Filtros ativos
                  </h3>
                  <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    <li>Periodo: {rangeLabel}</li>
                    <li>Agrupamento: {groupBy}</li>
                    <li>Formato: {formatLabel}</li>
                    <li>
                      Status considerados: {selectedStatuses.length}
                      {selectedStatuses.length > 0 && " selecoes"}
                    </li>
                    <li>Detalhamento: {includeDetails ? "Ativo" : "Resumido"}</li>
                    <li>Comparacao: {comparePreviousPeriod ? "Com variacao" : "Sem variacao"}</li>
                    <li>Destaque de anomalias: {highlightAnomalies ? "Habilitado" : "Desativado"}</li>
                    <li>Compartilhamento automatico: {autoShare ? "Programado" : "Manual"}</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Metricas selecionadas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMetrics.map((metricId) => {
                      const metric = template.metrics.find((item) => item.id === metricId);
                      return metric ? (
                        <Badge key={metric.id} variant="outline" className="border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-200">
                          {metric.label}
                        </Badge>
                      ) : null;
                    })}
                    {selectedMetrics.length === 0 && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Nenhuma metrica selecionada.
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Amostra do relatorio
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200/70 shadow-sm dark:border-slate-800/60">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900/40">
                        <TableRow>
                          {previewTable.columns.map((column) => (
                            <TableHead key={column.key}>{column.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewTable.rows.map((row, index) => (
                          <TableRow key={index}>
                            {previewTable.columns.map((column) => (
                              <TableCell key={column.key}>{(row as Record<string, string>)[column.key]}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
