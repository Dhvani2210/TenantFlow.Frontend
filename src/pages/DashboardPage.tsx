import { useEffect, useState } from "react";
import type { Project } from "../types/project";
import Navbar from "../components/Navbar";
import {ProjectCard} from "../components/ProjectCard";
import { getProjects, createProject, updateProject, deleteProject } from "../api/projects";
import ProjectFormModal from "../components/ProjectFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";


export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  useEffect(() => {
    getProjects()
      .then((data) => setProjects(data))
      .catch(() => setError("Failed to load projects."))
      .finally(() => setLoading(false));
  }, []);

   async function handleCreate(dto: { name: string; description: string }) {
    const created = await createProject(dto);
    setProjects(prev => [created, ...prev]);
  }

  async function handleUpdate(dto: { name: string; description: string }) {
    if (!editingProject) return;
    const updated = await updateProject(editingProject.id, dto);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  }

  async function handleDelete() {
    if (!deletingProjectId) return;
    setIsDeleting(true);
    try {
      await deleteProject(deletingProjectId);
      setProjects(prev => prev.filter(p => p.id !== deletingProjectId));
      setDeletingProjectId(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Projects</h2>
          {canManage && (
            <button
              onClick={() => { setEditingProject(null); setShowForm(true); }}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
            >
              New project
            </button>
          )}
        </div>

        {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading projects...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No projects found.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              canManage={canManage}
              onEdit={() => { setEditingProject(project); setShowForm(true); }}
              onDelete={() => setDeletingProjectId(project.id)}
            />
          ))}
        </div>
      </div>

      <ProjectFormModal
        isOpen={showForm}
        project={editingProject}
        onClose={() => setShowForm(false)}
        onSubmit={editingProject ? handleUpdate : handleCreate}
      />

      <ConfirmDialog
        isOpen={!!deletingProjectId}
        message="Are you sure you want to delete this project? All tasks inside it will also be deleted."
        onConfirm={handleDelete}
        onCancel={() => setDeletingProjectId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}