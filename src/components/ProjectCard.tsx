import type { Project } from '../types/project';
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  project: Project;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const PROJECT_COLORS = [
  "bg-indigo-500", "bg-violet-500", "bg-blue-500",
  "bg-emerald-500", "bg-orange-500", "bg-pink-500"
];

function getProjectColor(name: string) {
  const index = name.charCodeAt(0) % PROJECT_COLORS.length;
  return PROJECT_COLORS[index];
}

export function ProjectCard({ project, canManage, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();
  const colorClass = getProjectColor(project.name);
  const initial = project.name.charAt(0).toUpperCase();

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200 overflow-hidden">
      
      {/* Clickable body */}
      <div
        onClick={() => navigate(`/projects/${project.id}`)}
        className="p-5 cursor-pointer"
      >
        <div className="flex items-start gap-3">
          {/* Project color avatar */}
          <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
            <span className="text-white font-bold text-sm">{initial}</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              {project.name}
            </p>
            {project.description ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-600 mt-1 italic">No description</p>
            )}
          </div>
        </div>

        {/* Open board hint */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
          Open board
        </div>
      </div>

      {/* Actions footer */}
      {canManage && (
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                       text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20
                       hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                       text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10
                       hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}