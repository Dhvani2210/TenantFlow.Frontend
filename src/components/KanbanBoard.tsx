import { useState } from "react";
import type {
  Task,
  TaskStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "../types/task";
import { createTask, updateTask } from "../api/tasks";
import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  onTaskCreated: (task: Task) => void;
  onTaskUpdated: (task: Task) => void;
}

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onStatusChange: (newStatus: TaskStatus) => void;
}

function TaskCard({ task, onEdit, onStatusChange }: TaskCardProps) {
  return (
    <div
      className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600 
    hover:shadow-md transition-shadow cursor-pointer"
      onClick={onEdit}
    >
      <p className="font-medium text-sm text-gray-900 dark:text-white">
        {task.name}
      </p>
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          {task.description}
        </p>
      )}
      <select
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
        value={task.status}
        className="mt-2 text-xs border border-gray-200 dark:border-gray-600 rounded 
                px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 w-full"
      >
        <option value="Todo">Todo</option>
        <option value="InProgress">In Progress</option>
        <option value="Done">Done</option>
      </select>
    </div>
  );
}

interface ColumnConfig {
  label: string;
  tasks: Task[];
  headerClass: string;
  dotClass: string;
  status: TaskStatus;
}

export default function KanbanBoard({
  tasks,
  projectId,
  onTaskCreated,
  onTaskUpdated,
}: KanbanBoardProps) {
  const [modalStatus, setModalStatus] = useState<TaskStatus | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todoTasks = tasks.filter((t) => t.status === "Todo");
  const inProgressTasks = tasks.filter((t) => t.status === "InProgress");
  const doneTasks = tasks.filter((t) => t.status === "Done");

  const cols: ColumnConfig[] = [
    {
      label: "Todo",
      status: "Todo",
      tasks: todoTasks,
      headerClass: "text-gray-600 dark:text-gray-400",
      dotClass: "bg-gray-400",
    },
    {
      label: "In Progress",
      status: "InProgress",
      tasks: inProgressTasks,
      headerClass: "text-blue-600 dark:text-blue-400",
      dotClass: "bg-blue-500",
    },
    {
      label: "Done",
      status: "Done",
      tasks: doneTasks,
      headerClass: "text-green-600 dark:text-green-400",
      dotClass: "bg-green-500",
    },
  ];

  async function handleSubmit(data: CreateTaskRequest) {
    const newTask = await createTask(data);
    onTaskCreated(newTask);
  }

  async function handleStatusChange(task: Task, newStatus: TaskStatus) {
    const data: UpdateTaskRequest = {
      name: task.name,
      description: task.description ?? undefined,
      dueDate: task.dueDate ?? undefined,
      assignedToUserId: task.assignedToUserId ?? undefined,
      status: newStatus,
    };
    const updatedTask = await updateTask(projectId, task.taskId, data);
    onTaskUpdated(updatedTask);
  }

  return (
    <div className="px-6 py-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Kanban Board
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cols.map((col) => (
          <div
            key={col.label}
            className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 min-h-64"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-2 h-2 rounded-full ${col.dotClass}`} />
              <h3
                className={`font-semibold text-sm uppercase tracking-wide ${col.headerClass}`}
              >
                {col.label}
              </h3>
              <span className="ml-auto text-xs text-gray-400 font-medium">
                {col.tasks.length}
              </span>
              <button
                onClick={() => setModalStatus(col.status)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none transition-colors"
                title="Add task"
              >
                +
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {col.tasks.map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onEdit={() => setEditingTask(task)}
                  onStatusChange={(newStatus) =>
                    handleStatusChange(task, newStatus)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {modalStatus && projectId && (
        <CreateTaskModal
          projectId={projectId}
          defaultStatus={modalStatus}
          onClose={() => setModalStatus(null)}
          onSubmit={handleSubmit}
        />
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          projectId={projectId}
          onClose={() => setEditingTask(null)}
          onTaskUpdated={onTaskUpdated}
        />
      )}
    </div>
  );
}
