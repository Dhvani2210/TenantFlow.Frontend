import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { Task } from "../types/task";
import { getTasksByProject } from "../api/tasks";
import KanbanBoard from "../components/KanbanBoard";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { useTaskHub } from "../hooks/useTaskHub";
import { useDebounce } from "../hooks/useDebounce";

export default function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const { token } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "";
  const sortDirection = searchParams.get("sortDirection") ?? "asc";

  const debouncedSearch = useDebounce(search, 1000);

  function setSearch(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set("search", value);
      else next.delete("search");
      return next;
    });
  }

  function setStatus(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set("status", value);
      else next.delete("status");
      return next;
    });
  }

  function setSortBy(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set("sortBy", value);
      else next.delete("sortBy");
      return next;
    });
  }

  function setSortDirection(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("sortDirection", value);
      return next;
    });
  }

  function clearFilters() {
    setSearchParams({});
  }

  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    getTasksByProject(projectId, {
      search: debouncedSearch || undefined,
      status: status || undefined,
      sortBy: sortBy || undefined,
      sortDirection: sortBy ? sortDirection : undefined,
    })
      .then(setTasks)
      .catch(() => setError("Failed to load tasks. Please try again."))
      .finally(() => setIsLoading(false));
  }, [projectId, debouncedSearch, status, sortBy, sortDirection]);

  useTaskHub(token, {
    onTaskCreated: handleTaskCreated,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
  });

  function handleTaskCreated(newTask: Task) {
    setTasks((prev) => {
    if (prev.some((t) => t.taskId === newTask.taskId)) return prev;
    return [...prev, newTask];
  });
    setToast({ message: "Task created successfully.", type: "success" });
  }

  function handleTaskDeleted(deletedTaskId: string) {
    setTasks((prev) => prev.filter((t) => t.taskId !== deletedTaskId));
    setToast({ message: "Task deleted.", type: "success" });
  }

  function handleTaskUpdated(updatedTask: Task) {
    setTasks((prev) =>
      prev.map((t) => (t.taskId === updatedTask.taskId ? updatedTask : t))
    );
    setToast({ message: "Task updated successfully.", type: "success" });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="px-6 py-6 max-w-7xl mx-auto">
      
      <div className="flex flex-wrap items-center gap-3 mb-6 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
  
  {/* Search */}
  <div className="relative">
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="text"
      placeholder="Search tasks by name or description..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700
                 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white w-80
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                 placeholder:text-gray-400 dark:placeholder:text-gray-600"
    />
  </div>

  <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

  {/* Status dropdown */}
  <div className="relative">
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
    </svg>
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      className="pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700
                 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                 appearance-none cursor-pointer"
    >
      <option value="">All statuses</option>
      <option value="Todo">Todo</option>
      <option value="InProgress">In Progress</option>
      <option value="Done">Done</option>
    </select>
    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>

  {/* Sort by dropdown */}
  <div className="relative">
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
    </svg>
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700
                 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                 appearance-none cursor-pointer"
    >
      <option value="">Default sort</option>
      <option value="duedate">Due Date</option>
    </select>
    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>

  {/* Sort direction dropdown */}
  {sortBy && (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {sortDirection === "asc" ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
        )}
      </svg>
      <select
        value={sortDirection}
        onChange={(e) => setSortDirection(e.target.value)}
        className="pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700
                   bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                   appearance-none cursor-pointer"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )}

  {/* Clear filters */}
  {(search || status || sortBy) && (
    <button
      onClick={clearFilters}
      className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg
                 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20
                 hover:bg-red-100 dark:hover:bg-red-900/40
                 border border-red-200 dark:border-red-800 transition-colors"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      Clear filters
    </button>
  )}
</div>
<div className="mt-20 dhvani">
        {error ? (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/40 shadow-sm max-w-sm w-full text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Failed to load board</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The server may be unavailable. Check your connection and try again.</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
) : isLoading ? (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <svg className="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading board...</p>
    </div>
  </div>
) : (
          <KanbanBoard
            tasks={tasks}
            projectId={projectId!}
            statusFilter={status}
            onTaskCreated={handleTaskCreated}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
        )}
      </div>
</div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}