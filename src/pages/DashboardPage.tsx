import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Project } from "../types/project";
import type { PagedResult } from "../types/pagedResult";
import Navbar from "../components/Navbar";
import { ProjectCard } from "../components/ProjectCard";
import { getProjects, createProject, updateProject, deleteProject } from "../api/projects";
import ProjectFormModal from "../components/ProjectFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 3;

export default function DashboardPage() {
  const [pagedResult, setPagedResult] = useState<PagedResult<Project> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const { user } = useAuth();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);

  function setCurrentPage(page: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(page));
      return next;
    });
  }

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
    setToast({ message: "Project created successfully.", type: "success" });
  }

  async function handleUpdate(dto: { name: string; description: string }) {
    if (!editingProject) return;
    const updated = await updateProject(editingProject.id, dto);
    setPagedResult(prev => prev ? { ...prev, data: prev.data.map(p => p.id === updated.id ? updated : p) } : prev);
    setToast({ message: "Project updated successfully.", type: "success" });
  }

  async function handleDelete() {
    if (!deletingProjectId) return;
    setIsDeleting(true);
    try {
      await deleteProject(deletingProjectId);
      setPagedResult(prev => prev ? { ...prev, data: prev.data.filter(p => p.id !== deletingProjectId) } : prev);
      setDeletingProjectId(null);
      setToast({ message: "Project deleted.", type: "success" });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Projects</h2>
          {canManage && (
            <button
              onClick={() => { setEditingProject(null); setShowForm(true); }}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              New project
            </button>
          )}
        </div>
<div className="mt-20">
        {loading && (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <svg className="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading projects...</p>
    </div>
  </div>
)}
       {error && (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/40 shadow-sm max-w-sm w-full text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Failed to load projects</p>
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
)}
</div>
        {!loading && !error && projects.length === 0 && (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm max-w-sm w-full text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <svg className="w-6 h-6 text-gray-400 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h3.28a1 1 0 01.948.684l.5 1.5a1 1 0 00.949.684H19a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">No projects found</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Get started by creating your first project.</p>
      </div>
    </div>
  </div>
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
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700
                         text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700
                         text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800
                         disabled:opacity-40 disabled:cursor-not-allowed"
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