import { useEffect, useState } from "react";
import type { Project } from "../types/project";
import type { PagedResult } from "../types/pagedResult";
import Navbar from "../components/Navbar";
import {ProjectCard} from "../components/ProjectCard";
import { getProjects, createProject, updateProject, deleteProject } from "../api/projects";
import ProjectFormModal from "../components/ProjectFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 3;

export default function DashboardPage() {
  const [pagedResult, setPagedResult] = useState<PagedResult<Project> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  useEffect(() => {
    setLoading(true);
    getProjects(currentPage, PAGE_SIZE)
      .then((data) => setPagedResult(data))
      .catch(() => setError("Failed to load projects."))
      .finally(() => setLoading(false));
  }, [currentPage]);

  const projects = pagedResult?.data ?? [];
  const totalPages = pagedResult?.totalPages ?? 1;


   async function handleCreate(dto: { name: string; description: string }) {
    const created = await createProject(dto);
    setCurrentPage(1);
    setPagedResult(prev => prev ? { ...prev, data: [created, ...prev.data] } : prev);
  }

  async function handleUpdate(dto: { name: string; description: string }) {
    if (!editingProject) return;
    const updated = await updateProject(editingProject.id, dto);
    setPagedResult(prev => prev ? { ...prev, data: prev.data.map(p => p.id === updated.id ? updated : p) } : prev);
  }

  async function handleDelete() {
    if (!deletingProjectId) return;
    setIsDeleting(true);
    try {
      await deleteProject(deletingProjectId);
      setPagedResult(prev => prev ? { ...prev, data: prev.data.filter(p => p.id !== deletingProjectId) } : prev);
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

        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
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