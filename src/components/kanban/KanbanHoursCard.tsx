
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

interface HoursData {
  date: Date;
  totalHours: number;
  projectHours: number;
  difference: number;
}

interface KanbanHoursCardProps {
  hoursData: HoursData;
  isFlipped: boolean;
  onFlip: () => void;
}

export const KanbanHoursCard = ({ hoursData, isFlipped, onFlip }: KanbanHoursCardProps) => {
  return (
    <div className="relative" style={{ perspective: "1000px" }}>
      <div
        className={`transition-all duration-500 w-full ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="bg-gray-50 p-4 rounded-lg border absolute w-full backface-hidden">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">
              Comparativo de Horas - {hoursData.date.toLocaleDateString()}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onFlip}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Total de horas trabalhadas:</span>
              <span className="font-medium">{hoursData.totalHours}h</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total de horas em projetos:</span>
              <span className="font-medium">{hoursData.projectHours}h</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span>Diferença:</span>
              <span className={`font-medium ${hoursData.difference > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {hoursData.difference > 0 ? 'Faltam' : 'Excedeu'} {Math.abs(hoursData.difference)}h
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border absolute w-full backface-hidden [transform:rotateY(180deg)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Detalhes dos Projetos</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onFlip}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-white rounded border">
              <div className="font-medium">Projeto A</div>
              <div className="text-sm text-muted-foreground">4 horas</div>
            </div>
            <div className="p-2 bg-white rounded border">
              <div className="font-medium">Projeto B</div>
              <div className="text-sm text-muted-foreground">2 horas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
