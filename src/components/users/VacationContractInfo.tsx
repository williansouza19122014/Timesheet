
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface VacationContractInfoProps {
  contractType: string;
}

const VacationContractInfo = ({ contractType }: VacationContractInfoProps) => {
  const getRules = () => {
    switch (contractType) {
      case 'CLT':
      case 'Estágio':
        return {
          title: "Regras para CLT/Estágio",
          rules: [
            "Mínimo de 5 dias por período",
            "Máximo de 3 períodos",
            "Venda máxima de 10 dias (ou 1/3 do período)",
            "Pelo menos um período de 14 dias contínuos"
          ]
        };
      case 'PJ':
        return {
          title: "Regras para PJ",
          rules: [
            "Períodos fixos de 7, 10, 14, 21 ou 30 dias",
            "Venda máxima de 23 dias",
            "Possibilidade de exceções mediante aprovação"
          ]
        };
      default:
        return {
          title: "Tipo de Contrato não Definido",
          rules: ["Por favor, defina o tipo de contrato no cadastro do usuário."]
        };
    }
  };

  const { title, rules } = getRules();

  return (
    <Alert className="mb-6">
      <Info className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside mt-2 space-y-1">
          {rules.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default VacationContractInfo;
