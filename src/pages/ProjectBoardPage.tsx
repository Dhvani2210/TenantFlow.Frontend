import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Task } from "../types/task";
import { getTasksByProject } from "../api/tasks";
import KanbanBoard from "../components/KanbanBoard";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useTaskHub } from "../hooks/useTaskHub";

export default function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();

  useEffect(() => {   
    if (!projectId) return;

    setIsLoading(true);
    setError(null);

    getTasksByProject(projectId)
      .then(setTasks)
      .catch(() => setError("Failed to load tasks. Please try again."))
      .finally(() => setIsLoading(false));
  }, [projectId]);


  useTaskHub(token, {
  onTaskCreated: handleTaskCreated,
  onTaskUpdated: handleTaskUpdated,
  onTaskDeleted: handleTaskDeleted,
});


  function handleTaskCreated(newTask: Task) {
    setTasks((prev) => [...prev, newTask]);
  }

  function handleTaskDeleted(deletedTaskId: string) {
    setTasks((prev) => prev.filter((t) => t.taskId !== deletedTaskId));
  }

  function handleTaskUpdated(updatedTask: Task) {
    setTasks((prev) =>
      prev.map((t) => (t.taskId === updatedTask.taskId ? updatedTask : t)),
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Loading board...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      <KanbanBoard
        tasks={tasks}
        projectId={projectId!}
        onTaskCreated={handleTaskCreated}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
  );
}
