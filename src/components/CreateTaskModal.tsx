import { useEffect, useState } from "react";
import type { TaskStatus, CreateTaskRequest } from "../types/task";
import type { User } from "../types/user";
import { getUsers } from "../api/users";

interface CreateTaskModalProps {
    projectId: string;
    defaultStatus: TaskStatus;
    onClose: () => void;
    onSubmit: (data: CreateTaskRequest) => Promise<void>;
}

export default function CreateTaskModal({
    projectId,
    defaultStatus,
    onClose,
    onSubmit,
}: CreateTaskModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
     const [dueDate, setDueDate] = useState("");
    const [assignedToUserId, setAssignedToUserId] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        getUsers().then(setUsers).catch(() => {});
    }, []);

    async function handleSubmit() {
        if (!name.trim()) {
            setError("Task name is required.");
            return;
        }

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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    New Task
                </h3>

                {error && (
                    <p className="text-red-500 text-sm mb-3">{error}</p>
                )}

                <div className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Task name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                        placeholder="Description (optional)"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
               
                 <input
                        type="date"
                        value={dueDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={e => setDueDate(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={assignedToUserId}
                        onChange={e => setAssignedToUserId(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Unassigned</option>
                        {users.map(user => (
                            <option key={user.userId} value={user.userId}>
                                {user.fullName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-2 mt-5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                    >
                        {isSubmitting ? "Creating..." : "Create Task"}
                    </button>
                </div>
            </div>
        </div>
    );
}