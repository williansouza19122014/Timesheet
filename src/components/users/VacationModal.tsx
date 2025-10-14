import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import VacationPeriods from "./VacationPeriods";
import VacationRequests from "./VacationRequests";
import NewVacationRequest from "./NewVacationRequest";
import VacationContractInfo from "./VacationContractInfo";
import { SystemUser } from "@/types/users";
import {
  ensureVacationData,
  createDefaultVacationEntry,
} from "@/utils/vacation-storage";
import { VacationPeriod } from "@/types/vacations";

interface VacationModalProps {
  user: SystemUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VacationModal = ({ user, open, onOpenChange }: VacationModalProps) => {
  const [periods, setPeriods] = useState<VacationPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadVacationPeriods = useCallback(() => {
    if (!open) {
      return;
    }

    try {
      setIsLoading(true);
      const entry = ensureVacationData(user.id, () => createDefaultVacationEntry(user.id));
      setPeriods(entry.periods);
    } catch (error) {
      console.error("Erro ao carregar períodos aquisitivos:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar períodos aquisitivos",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [open, toast, user.id]);

  useEffect(() => {
    loadVacationPeriods();
  }, [loadVacationPeriods]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gestão de Férias - {user.name}</DialogTitle>
        </DialogHeader>

        <VacationContractInfo contractType={user.contract_type || "CLT"} />

        <Tabs defaultValue="periods" className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-2">
            <TabsTrigger value="periods">Períodos Aquisitivos</TabsTrigger>
            <TabsTrigger value="requests">Solicitações</TabsTrigger>
            <TabsTrigger value="new" disabled={periods.length === 0}>
              Nova Solicitação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="periods">
            <VacationPeriods periods={periods} isLoading={isLoading} />
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
                  description: "Sua solicitação de férias foi enviada para aprovação",
                });
              }}
              contractType={user.contract_type || "CLT"}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VacationModal;
