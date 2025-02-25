
import { KanbanCard } from "@/types/kanban";

export const mockData: KanbanCard[] = [
  {
    id: "1",
    title: "Correção de Horário - João Silva",
    description: "Solicitação de correção de horário do dia 15/04",
    status: "requested",
    date: new Date(),
    requesterId: "1",
    requesterName: "João Silva",
    timeCorrection: {
      date: "2024-04-15",
      times: [
        { entrada: "08:00", saida: "12:00" },
        { entrada: "13:00", saida: "17:00" }
      ],
      justification: "Esqueci de registrar a entrada",
      document: "atestado.pdf"
    },
    chat: [
      {
        id: "1",
        userId: "1",
        userName: "João Silva",
        message: "Solicito a correção do horário conforme justificativa anexa.",
        timestamp: new Date(2024, 3, 15, 9, 30),
        isLeader: false
      },
      {
        id: "2",
        userId: "2",
        userName: "Maria Santos",
        message: "Verificarei a solicitação em breve.",
        timestamp: new Date(2024, 3, 15, 10, 0),
        isLeader: true
      }
    ]
  },
  {
    id: "2",
    title: "Correção de Horário - Maria Santos",
    description: "Correção necessária no registro do dia 14/04",
    status: "needsCorrection",
    date: new Date(),
    requesterId: "2",
    requesterName: "Maria Santos",
    timeCorrection: {
      date: "2024-04-14",
      times: [
        { entrada: "09:00", saida: "18:00" }
      ],
      justification: "Sistema fora do ar"
    }
  }
];
