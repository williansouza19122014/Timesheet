
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

interface ProjectTime {
  name: string;
  hours: number;
  details: Array<{
    time: string;
    duration: number;
  }>;
}

interface HoursData {
  date: Date;
  totalHours: number;
  projectHours: number;
  difference: number;
  projects: ProjectTime[];
}

interface KanbanHoursCardProps {
  hoursData: HoursData;
  isFlipped: boolean;
  onFlip: () => void;
}

export const KanbanHoursCard = ({ hoursData, isFlipped, onFlip }: KanbanHoursCardProps) => {
  const totalProjectHours = hoursData.projects.reduce((acc, project) => acc + project.hours, 0);

  return (
    <div className="relative h-[180px] mb-6" style={{ perspective: "1000px" }}>
      <div
        className={`transition-all duration-500 w-full absolute ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="bg-gray-50 p-3 rounded-lg border absolute w-full backface-hidden">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-sm">
              Comparativo de Horas - {hoursData.date.toLocaleDateString()}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onFlip}
              className="h-8 w-8"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span>Total de horas trabalhadas:</span>
              <span className="font-medium">{hoursData.totalHours}h</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Total de horas em projetos:</span>
              <span className="font-medium">{hoursData.projectHours}h</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t text-sm">
              <span>Diferença:</span>
              <span className={`font-medium ${hoursData.difference > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {hoursData.difference > 0 ? 'Faltam' : 'Excedeu'} {Math.abs(hoursData.difference)}h
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg border absolute w-full backface-hidden [transform:rotateY(180deg)]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-sm">Detalhes dos Projetos</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onFlip}
              className="h-8 w-8"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
            {hoursData.projects.map((project, index) => (
              <div key={index} className="p-2 bg-white rounded border text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-muted-foreground">{project.hours}h</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {project.details.map((detail, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                      <span>{detail.time}</span>
                      <span>{detail.duration}h</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-1.5 border-t text-sm">
              <span className="font-medium">Total:</span>
              <span className="font-medium">{totalProjectHours}h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
