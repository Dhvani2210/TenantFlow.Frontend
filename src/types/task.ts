export type TaskStatus = "Todo" | "InProgress" | "Done";

export interface Task {
  taskId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  dueDate: string | null;
  projectId: string;
  assignedToUserId: string | null;
  assignedToUserName?: string;
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

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  dueDate?: string;
  assignedToUserId?: string;
  status: TaskStatus;
}