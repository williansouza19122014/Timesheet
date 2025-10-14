import { apiFetch } from "./api-client";

export type KanbanBackendStatus = "todo" | "doing" | "review" | "done";

export interface KanbanApiCard {
  id: string;
  boardId: string;
  columnId: string;
  projectId: string;
  title: string;
  description?: string;
  position: number;
  status: KanbanBackendStatus;
  tags?: string[];
  dueDate?: string;
  priority: "low" | "medium" | "high";
  assignees: string[];
  correction?: {
    date?: string;
    justification?: string;
    documentName?: string;
    times?: Array<{ entrada?: string; saida?: string }>;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanApiColumn {
  id: string;
  boardId: string;
  title: string;
  position: number;
  limit?: number;
  createdAt: string;
  updatedAt: string;
  cards: KanbanApiCard[];
}

export interface KanbanApiBoard {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  columns: KanbanApiColumn[];
}

export async function fetchKanbanBoards(): Promise<KanbanApiBoard[]> {
  return apiFetch<KanbanApiBoard[]>("/api/kanban/boards");
}

export interface KanbanCorrectionPayload {
  date?: string;
  justification?: string;
  documentName?: string;
  times?: Array<{ entrada?: string; saida?: string }>;
}

export interface CreateKanbanCardPayload {
  columnId: string;
  title: string;
  description?: string | null;
  status?: KanbanBackendStatus;
  tags?: string[];
  dueDate?: string | null;
  priority?: "low" | "medium" | "high" | null;
  assignees?: string[];
  position?: number | null;
  correction?: KanbanCorrectionPayload | null;
}

export async function moveKanbanCard(
  cardId: string,
  payload: { targetColumnId: string; targetPosition?: number | null }
): Promise<KanbanApiCard> {
  return apiFetch<KanbanApiCard>(`/api/kanban/cards/${cardId}/move`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateKanbanCard(
  cardId: string,
  payload: Partial<
    Pick<KanbanApiCard, "title" | "description" | "status" | "tags" | "priority" | "dueDate" | "assignees">
  > & { correction?: KanbanCorrectionPayload | null }
): Promise<KanbanApiCard> {
  return apiFetch<KanbanApiCard>(`/api/kanban/cards/${cardId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function createKanbanCard(payload: CreateKanbanCardPayload): Promise<KanbanApiCard> {
  return apiFetch<KanbanApiCard>("/api/kanban/cards", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteKanbanCard(cardId: string): Promise<void> {
  await apiFetch(`/api/kanban/cards/${cardId}`, {
    method: "DELETE",
    skipJson: true,
  });
}
