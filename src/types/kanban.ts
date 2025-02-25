
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

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  status: "requested" | "inAnalysis" | "needsCorrection" | "approved";
  date: Date;
  requesterId: string;
  requesterName: string;
  timeCorrection: TimeCorrection;
  chat?: ChatMessage[];
}

export interface KanbanColumn {
  id: "requested" | "inAnalysis" | "needsCorrection" | "approved";
  title: string;
  cards: KanbanCard[];
}
