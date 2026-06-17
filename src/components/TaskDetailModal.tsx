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

export default function TaskDetailModal({
  task,
  projectId,
  onClose,
  onEdit,
  onDeleted,
}: TaskDetailModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const { user } = useAuth();
  const canDelete = user?.role === "Admin" || user?.role === "Manager";


  if (task == null) return null;
  function handleDeleteClick() {
    setShowConfirm(true);
  }
  async function handleDelete() {
    if (!task) return;
    setIsDeleting(true);
    setError(null);

    try {
      await deleteTask(projectId, task.taskId);
      //onDeleted(task.taskId);
      onClose();
    } catch {
      setError("Failed to delete task. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
            {task.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none shrink-0"
          >
            ×
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
              Description
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {task.description ?? "No description"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
              Status
            </p>
            <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              {task.status}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
              Assigned To
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {task.assignedToUserName ?? "Not assigned"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
              Due Date
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : "No due date"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
              Created At
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Edit
          </button>
          {canDelete && (
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
          >
            {isDeleting ? "Deleting..." : "Delete Task"}
          </button>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={showConfirm}
        message={`Are you sure you want to delete "${task?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}
