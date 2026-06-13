export type TaskStatus = "Todo" | "InProgress" | "Done";

export interface Task {
  taskId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  dueDate: string | null;
  projectId: string;
  assignedToUserId: string | null;
  createdAt: string;
  updatedAt: string | null;
  status: TaskStatus;
}

export interface CreateTaskRequest {
    name: string;
    description?: string;
    projectId: string;
    status: TaskStatus;
    dueDate?: string;
    assignedToUserId?: string;
}