import { deleteTask } from "../api/tasks";
import type { Task } from "../types/task";
import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { useAuth } from "../context/AuthContext";

interface TaskDetailModalProps {
  task: Task | null;
  projectId: string;
  onClose: () => void;
  onEdit: () => void;
  onDeleted: (taskId: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  Todo: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  InProgress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Done: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

const STATUS_LABELS: Record<string, string> = {
  Todo: "To Do",
  InProgress: "In Progress",
  Done: "Done",
};

export default function TaskDetailModal({ task, projectId, onClose, onEdit, onDeleted }: TaskDetailModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user } = useAuth();
  const canDelete = user?.role === "Admin" || user?.role === "Manager";

  if (!task) return null;

  async function handleDelete() {
    if (!task) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteTask(projectId, task.taskId);
      onDeleted(task.taskId);
      onClose();
    } catch {
      setError("Failed to delete task. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white leading-snug">{task.name}</h2>
            <span className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[task.status]}`}>
              {STATUS_LABELS[task.status]}
            </span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {task.description ?? <span className="text-gray-400 dark:text-gray-600 italic">No description provided</span>}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Assigned to</p>
              <div className="flex items-center gap-2">
                {task.assignedToUserName ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                      {task.assignedToUserName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{task.assignedToUserName}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-600 italic">Not assigned</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Due date</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : <span className="text-gray-400 dark:text-gray-600 italic">No due date</span>}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Created</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <button onClick={onEdit} className="px-4 py-2 text-sm font-medium rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          {canDelete && (
            <button onClick={() => setShowConfirm(true)} disabled={isDeleting} className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        message={`Are you sure you want to delete "${task.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}