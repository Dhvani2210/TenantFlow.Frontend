import type { Project } from '../types/project';
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  project: Project;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, canManage, onEdit, onDelete }: ProjectCardProps) {
    const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div
        onClick={() => navigate(`/projects/${project.id}`)}
        className="cursor-pointer"
      >
        <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
        {project.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
        )}
      </div>

      {canManage && (
        <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-xs text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}