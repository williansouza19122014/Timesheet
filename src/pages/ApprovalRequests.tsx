
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

interface TimeCorrection {
  id: string;
  userId: string;
  userName: string;
  date: string;
  entrada1: string;
  saida1: string;
  entrada2: string;
  saida2: string;
  entrada3: string;
  saida3: string;
  justification: string;
  status: "pending" | "approved" | "rejected";
}

const ApprovalRequests = () => {
  const [requests, setRequests] = useState<TimeCorrection[]>([]);
  const { toast } = useToast();

  const handleApprove = (request: TimeCorrection) => {
    setRequests((prevRequests) =>
      prevRequests.map((item) =>
        item.id === request.id ? { ...item, status: "approved" } : item
      )
    );
    toast({
      title: "Solicitação aprovada",
      description: `A solicitação de ${request.userName} foi aprovada`
    });
  };

  const handleReject = (request: TimeCorrection) => {
    setRequests((prevRequests) =>
      prevRequests.map((item) =>
        item.id === request.id ? { ...item, status: "rejected" } : item
      )
    );
    toast({
      variant: "destructive",
      title: "Solicitação rejeitada",
      description: `A solicitação de ${request.userName} foi rejeitada`
    });
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Aprovação de Solicitações</h1>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Não há solicitações pendentes
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-sm border p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{request.userName}</h3>
                  <p className="text-sm text-muted-foreground">{request.date}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Rejeitar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Entrada 1</p>
                  <p>{request.entrada1}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Saída 1</p>
                  <p>{request.saida1}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Entrada 2</p>
                  <p>{request.entrada2}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Saída 2</p>
                  <p>{request.saida2}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Entrada 3</p>
                  <p>{request.entrada3}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Saída 3</p>
                  <p>{request.saida3}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Justificativa</p>
                <p className="text-sm text-muted-foreground">{request.justification}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalRequests;
