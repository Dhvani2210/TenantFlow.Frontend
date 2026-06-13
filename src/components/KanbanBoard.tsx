import { useState } from "react";
import type { Task, TaskStatus, CreateTaskRequest } from "../types/task";
import { createTask } from "../api/tasks";
import CreateTaskModal from "./CreateTaskModal";

interface KanbanBoardProps {
  todoTasks: Task[];
  inProgressTasks: Task[];
  doneTasks: Task[];
  onTaskCreated: (task: Task) => void;
  projectId: string;
}

interface TaskCardProps {
  task: Task;
}

function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-default">
            <p className="font-medium text-sm text-gray-900 dark:text-white">
                {task.name}
            </p>
            {task.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {task.description}
                </p>
            )}
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
  todoTasks,
  inProgressTasks,
  doneTasks,
  projectId,
  onTaskCreated
}: KanbanBoardProps) {

const[modalStatus, setModalStatus] = useState<TaskStatus | null>(null);

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
                            <h3 className={`font-semibold text-sm uppercase tracking-wide ${col.headerClass}`}>
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
                                <TaskCard key={task.taskId} task={task} />
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
        </div>
    );
}