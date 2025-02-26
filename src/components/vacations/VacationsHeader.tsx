
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import NewVacationRequest from "@/components/users/NewVacationRequest";
import { VacationPeriod } from "@/types/vacations";

interface VacationsHeaderProps {
  periods: VacationPeriod[];
  onExport: () => void;
  onRequestSuccess: () => void;
}

const VacationsHeader = ({ periods, onExport, onRequestSuccess }: VacationsHeaderProps) => {
  const { toast } = useToast();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Férias</h2>
        <p className="text-muted-foreground">
          Gerencie seus períodos aquisitivos e solicite férias
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={onExport}>
          <FileDown className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Nova Solicitação de Férias</DialogTitle>
            </DialogHeader>
            <NewVacationRequest
              userId={periods[0]?.user_id || ''}
              periods={periods}
              onSuccess={() => {
                onRequestSuccess();
                toast({
                  title: "Solicitação enviada",
                  description: "Sua solicitação de férias foi enviada para aprovação"
                });
              }}
              contractType={periods[0]?.contract_type || 'CLT'}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VacationsHeader;
