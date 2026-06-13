import { useEffect, useState } from "react";
import { getProjects } from "../api/projects";
import type { Project } from "../types/project";
import Navbar from "../components/Navbar";
import {ProjectCard} from "../components/ProjectCard";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
      .then((data) => setProjects(data))
      .catch(() => setError("Failed to load projects."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Projects
        </h2>

        {loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading projects...
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && projects.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No projects found.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}