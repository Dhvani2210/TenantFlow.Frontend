import type { Task } from "../types/task";
interface KanbanBoardProps {
  todoTasks: Task[];
  inProgressTasks: Task[];
  doneTasks: Task[];
}

export default function KanbanBoard({
  todoTasks,
  inProgressTasks,
  doneTasks,
}: KanbanBoardProps) {
  return (
    <div>
      <div className="px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Kanban Board
        </h2>
        </div>
      <div className="grid grid-cols-3 gap-4">
     
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <h2 className="font-semibold mb-3">Todo</h2>
          <div className="flex flex-col gap-2">
            {todoTasks.map((task) => (
              <div
                key={task.taskId}
                className="bg-white dark:bg-gray-700 rounded p-3 shadow-sm"
              >
                <p className="font-medium text-sm">{task.name}</p>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {task.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

<div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <h2 className="font-semibold mb-3">In Progress</h2>
          <div className="flex flex-col gap-2">
            {inProgressTasks.map((task) => (
              <div
                key={task.taskId}
                className="bg-white dark:bg-gray-700 rounded p-3 shadow-sm"
              >
                <p className="font-medium text-sm">{task.name}</p>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {task.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>


<div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <h2 className="font-semibold mb-3">Done</h2>
          <div className="flex flex-col gap-2">
            {doneTasks.map((task) => (
              <div
                key={task.taskId}
                className="bg-white dark:bg-gray-700 rounded p-3 shadow-sm"
              >
                <p className="font-medium text-sm">{task.name}</p>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {task.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
