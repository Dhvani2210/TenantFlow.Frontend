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
  <div onClick={handleClick} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 cursor-pointer">
    <p>{project.name}</p>
    {project.description && <p>{project.description}</p>}
  </div>
);
}