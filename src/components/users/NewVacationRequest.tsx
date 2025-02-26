
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface VacationPeriod {
  id: string;
  start_date: string;
  end_date: string;
  days_available: number;
  limit_date: string | null;
}

interface NewVacationRequestProps {
  userId: string;
  periods: VacationPeriod[];
  onSuccess: () => void;
}

const NewVacationRequest = ({ userId, periods, onSuccess }: NewVacationRequestProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [comments, setComments] = useState("");
  const [sellDays, setSellDays] = useState(false);
  const [daysToSell, setDaysToSell] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPeriod) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um período aquisitivo"
      });
      return;
    }

    const period = periods.find(p => p.id === selectedPeriod);
    if (!period) return;

    let totalDays = 0;
    
    // Calcula dias de férias
    if (startDate && endDate) {
      totalDays = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
    }
    
    // Adiciona dias vendidos
    if (sellDays) {
      totalDays += daysToSell;
    }

    if (totalDays > period.days_available) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Total de dias (${totalDays}) excede o saldo disponível (${period.days_available})`
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('vacation_requests')
        .insert([{
          vacation_period_id: selectedPeriod,
          user_id: userId,
          start_date: startDate || null,
          end_date: endDate || null,
          days_taken: startDate && endDate ? differenceInDays(parseISO(endDate), parseISO(startDate)) + 1 : 0,
          sold_days: sellDays ? daysToSell : 0,
          comments
        }]);

      if (error) throw error;

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao solicitar férias:', error);
      toast({
        variant: "destructive",
        title: "Erro ao solicitar férias",
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg">
      <div>
        <Label htmlFor="period">Período Aquisitivo *</Label>
        <Select
          value={selectedPeriod}
          onValueChange={setSelectedPeriod}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period, index) => (
              <SelectItem key={period.id} value={period.id}>
                {format(new Date(period.start_date), 'dd/MM/yyyy')} - {format(new Date(period.end_date), 'dd/MM/yyyy')} ({period.days_available} dias disponíveis)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sell_days"
            checked={sellDays}
            onCheckedChange={(checked) => setSellDays(checked as boolean)}
          />
          <Label htmlFor="sell_days">Vender dias de férias</Label>
        </div>

        {sellDays && (
          <div>
            <Label htmlFor="days_to_sell">Quantidade de dias para vender</Label>
            <Input
              id="days_to_sell"
              type="number"
              min={0}
              max={10}
              value={daysToSell}
              onChange={(e) => setDaysToSell(Number(e.target.value))}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Máximo de 10 dias permitido para venda
            </p>
          </div>
        )}
      </div>

      {(!sellDays || daysToSell < (selectedPeriod ? periods.find(p => p.id === selectedPeriod)?.days_available || 0 : 0)) && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">Data Inicial</Label>
            <div className="relative">
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="end_date">Data Final</Label>
            <div className="relative">
              <Input
                id="end_date"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="comments">Observações</Label>
        <Textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Adicione observações se necessário"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enviando..." : "Solicitar Férias"}
      </Button>
    </form>
  );
};

export default NewVacationRequest;
