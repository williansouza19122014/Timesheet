
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

interface VacationPeriod {
  id: string;
  start_date: string;
  end_date: string;
  days_available: number;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPeriod || !startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }

    const daysTaken = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
    const period = periods.find(p => p.id === selectedPeriod);

    if (!period) return;

    if (daysTaken > period.days_available) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Você só possui ${period.days_available} dias disponíveis neste período`
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
          start_date: startDate,
          end_date: endDate,
          days_taken: daysTaken,
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
    <form onSubmit={handleSubmit} className="space-y-4">
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
                {`${index + 1}º Período - ${period.days_available} dias disponíveis`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Data Inicial *</Label>
          <div className="relative">
            <Input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <Label htmlFor="end_date">Data Final *</Label>
          <div className="relative">
            <Input
              id="end_date"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

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
