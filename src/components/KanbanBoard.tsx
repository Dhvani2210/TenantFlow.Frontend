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
import TaskDetailModal from "./TaskDetailModal";

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  statusFilter?: string;
  onTaskCreated: (task: Task) => void;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

interface TaskCardProps {
  task: Task;
  onStatusChange: (newStatus: TaskStatus) => void;
  onView: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  Todo: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  InProgress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Done: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

const STATUS_LABELS: Record<string, string> = {
  Todo: "Todo",
  InProgress: "In Progress",
  Done: "Done",
};

function TaskCard({ task, onStatusChange, onView }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";

  return (
    <div
      onClick={onView}
      className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700
                 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700
                 transition-all duration-150 cursor-pointer"
    >
      {/* Task name */}
      <p className="font-medium text-sm text-gray-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {task.name}
      </p>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer row */}
      <div className="mt-3 flex items-center justify-between gap-2">
        {/* Assignee avatar */}
        {task.assignedToUserName ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {task.assignedToUserName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-20">
              {task.assignedToUserName.split(" ")[0]}
            </span>
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600" />
        )}

        {/* Due date */}
        {task.dueDate && (
          <span className={`text-xs font-medium flex items-center gap-1 ${
            isOverdue ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500"
          }`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      {/* Status change — stopPropagation so it doesn't open detail modal */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status]}`}>
          {STATUS_LABELS[task.status]}
        </span>
        <select
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => { e.stopPropagation(); onStatusChange(e.target.value as TaskStatus); }}
          value={task.status}
          className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg
                     px-2 py-1 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300
                     focus:outline-none focus:ring-1 focus:ring-indigo-500
                     cursor-pointer appearance-none"
        >
          <option value="Todo">→ Todo</option>
          <option value="InProgress">→ In Progress</option>
          <option value="Done">→ Done</option>
        </select>
      </div>
    </div>
  );
}

interface ColumnConfig {
  label: string;
  tasks: Task[];
  headerClass: string;
  headerBg: string;
  dotClass: string;
  badgeClass: string;
  status: TaskStatus;
}

export default function KanbanBoard({
  tasks,
  projectId,
  statusFilter,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
}: KanbanBoardProps) {
  const [modalStatus, setModalStatus] = useState<TaskStatus | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);

  // Always derive the task shown in modals from the live `tasks` array,
  // rather than holding onto a stale snapshot captured at click time.
  // This ensures the detail/edit modals immediately reflect updates
  // (from the edit form, SignalR pushes, status-change dropdown, etc.)
  // without needing to be closed and reopened.
  const editingTask = editingTaskId
    ? tasks.find((t) => t.taskId === editingTaskId) ?? null
    : null;
  const viewingTask = viewingTaskId
    ? tasks.find((t) => t.taskId === viewingTaskId) ?? null
    : null;

  const todoTasks = tasks.filter((t) => t.status === "Todo");
  const inProgressTasks = tasks.filter((t) => t.status === "InProgress");
  const doneTasks = tasks.filter((t) => t.status === "Done");

  const cols: ColumnConfig[] = [
    {
      label: "Todo",
      status: "Todo",
      tasks: todoTasks,
      headerClass: "text-gray-600 dark:text-gray-400",
      headerBg: "bg-gray-50 dark:bg-gray-800/50",
      dotClass: "bg-gray-400",
      badgeClass: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    },
    {
      label: "In Progress",
      status: "InProgress",
      tasks: inProgressTasks,
      headerClass: "text-blue-600 dark:text-blue-400",
      headerBg: "bg-blue-50 dark:bg-blue-900/20",
      dotClass: "bg-blue-500",
      badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    },
    {
      label: "Done",
      status: "Done",
      tasks: doneTasks,
      headerClass: "text-green-600 dark:text-green-400",
      headerBg: "bg-green-50 dark:bg-green-900/20",
      dotClass: "bg-green-500",
      badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    },
  ];

  const visibleCols = statusFilter
    ? cols.filter((c) => c.status === statusFilter)
    : cols;

  async function handleSubmit(data: CreateTaskRequest) {
    const created = await createTask(data);
    onTaskCreated(created);
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
    <div className="py-2">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">
        Kanban Board
      </h2>
      <div className={`grid grid-cols-1 gap-5 ${
        visibleCols.length === 1 ? "md:grid-cols-1 max-w-sm" :
        visibleCols.length === 2 ? "md:grid-cols-2 max-w-2xl" :
        "md:grid-cols-3 max-w-5xl"
      }`}>
        {visibleCols.map((col) => (
          <div
            key={col.label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-64 overflow-hidden"
          >
            {/* Column header */}
            <div className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${col.headerBg}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dotClass}`} />
                <h3 className={`font-semibold text-sm uppercase tracking-wide ${col.headerClass}`}>
                  {col.label}
                </h3>
                <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${col.badgeClass}`}>
                  {col.tasks.length}
                </span>
                <button
                  onClick={() => setModalStatus(col.status)}
                  className="w-6 h-6 flex items-center justify-center rounded-md
                             text-gray-400 hover:text-indigo-600 hover:bg-indigo-50
                             dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20
                             transition-colors ml-1"
                  title="Add task"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Cards */}
            <div className="p-3 flex flex-col gap-2">
              {col.tasks.map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onView={() => setViewingTaskId(task.taskId)}
                  onStatusChange={(newStatus) => handleStatusChange(task, newStatus)}
                />
              ))}
              {col.tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-600">No tasks yet</p>
                </div>
              )}
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
          onClose={() => setEditingTaskId(null)}
          onTaskUpdated={onTaskUpdated}
        />
      )}

      {viewingTask && (
        <TaskDetailModal
          task={viewingTask}
          projectId={projectId}
          onClose={() => setViewingTaskId(null)}
          onEdit={() => { setViewingTaskId(null); setEditingTaskId(viewingTask.taskId); }}
          onDeleted={onTaskDeleted}
        />
      )}
    </div>
  );
}