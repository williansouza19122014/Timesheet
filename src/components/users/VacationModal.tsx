
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VacationPeriods from "./VacationPeriods";
import VacationRequests from "./VacationRequests";
import NewVacationRequest from "./NewVacationRequest";
import VacationContractInfo from "./VacationContractInfo";
import { SystemUser } from "@/types/users";

interface VacationModalProps {
  user: SystemUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VacationPeriod {
  id: string;
  start_date: string;
  end_date: string;
  days_available: number;
  limit_date: string | null;
  contract_type: string;
}

const VacationModal = ({ user, open, onOpenChange }: VacationModalProps) => {
  const [periods, setPeriods] = useState<VacationPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadVacationPeriods();
    }
  }, [open]);

  const loadVacationPeriods = async () => {
    try {
      const { data, error } = await supabase
        .from('vacation_periods')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setPeriods(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar períodos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar períodos aquisitivos",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gestão de Férias - {user.name}</DialogTitle>
        </DialogHeader>

        <VacationContractInfo contractType={user.contract_type || 'CLT'} />

        <Tabs defaultValue="periods" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="periods">Períodos Aquisitivos</TabsTrigger>
            <TabsTrigger value="requests">Solicitações</TabsTrigger>
            <TabsTrigger value="new" disabled={periods.length === 0}>
              Nova Solicitação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="periods">
            <VacationPeriods 
              periods={periods}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="requests">
            <VacationRequests userId={user.id} />
          </TabsContent>

          <TabsContent value="new">
            <NewVacationRequest
              userId={user.id}
              periods={periods}
              onSuccess={() => {
                loadVacationPeriods();
                toast({
                  title: "Solicitação enviada",
                  description: "Sua solicitação de férias foi enviada para aprovação"
                });
              }}
              contractType={user.contract_type || 'CLT'}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VacationModal;
