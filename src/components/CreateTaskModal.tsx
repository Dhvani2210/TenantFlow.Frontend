import { useEffect, useState } from "react";
import type { TaskStatus, CreateTaskRequest } from "../types/task";
import type { User } from "../types/user";
import { getAllUsers } from "../api/users";

interface CreateTaskModalProps {
  projectId: string;
  defaultStatus: TaskStatus;
  onClose: () => void;
  onSubmit: (data: CreateTaskRequest) => Promise<void>;
}

export default function CreateTaskModal({ projectId, defaultStatus, onClose, onSubmit }: CreateTaskModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(() => {});
  }, []);

  async function handleSubmit() {
    if (!name.trim()) { setError("Task name is required."); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        projectId,
        status: defaultStatus,
        dueDate: dueDate || undefined,
        assignedToUserId: assignedToUserId || undefined,
      });
      onClose();
    } catch {
      setError("Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = `w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg
    bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
    placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-shadow`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">New Task</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Add a task to this project</p>
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Task name <span className="text-red-500">*</span>
            </label>
            <input type="text" placeholder="e.g. Design login page" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Description <span className="text-gray-400 font-normal normal-case">(optional)</span>
            </label>
            <textarea placeholder="What needs to be done?" value={description} onChange={e => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Due date</label>
              <input type="date" value={dueDate} min={new Date().toISOString().split("T")[0]} onChange={e => setDueDate(e.target.value)} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Assign to</label>
              <select value={assignedToUserId} onChange={e => setAssignedToUserId(e.target.value)} className={inputClass}>
                <option value="">Unassigned</option>
                {users.map(user => <option key={user.userId} value={user.userId}>{user.fullName}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors flex items-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </>
            ) : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}