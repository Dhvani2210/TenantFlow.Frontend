import type { Project } from '../types/project';
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
  <div
  onClick={handleClick}
  className="bg-white dark:bg-gray-800 rounded-xl p-4 cursor-pointer border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
>
  <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
  {project.description && (
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
  )}
</div>
);
}