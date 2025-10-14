
export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  isLeader: boolean;
}

export interface TimeCorrection {
  date: string;
  times: {
    entrada: string;
    saida: string;
  }[];
  justification: string;
  document?: string;
}

export type KanbanFrontendStatus =
  | "requested"
  | "inAnalysis"
  | "needsCorrection"
  | "approved";

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  status: KanbanFrontendStatus;
  date: Date;
  requesterId?: string;
  requesterName?: string;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  dueDate?: string;
  columnId?: string;
  timeCorrection: TimeCorrection;
  chat?: ChatMessage[];
}

export interface KanbanColumn {
  id: KanbanFrontendStatus;
  title: string;
  cards: KanbanCard[];
}
