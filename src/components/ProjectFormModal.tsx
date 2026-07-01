import { useState, useEffect } from "react";
import type { Project } from "../types/project";

interface Props {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSubmit: (dto: { name: string; description: string }) => Promise<void>;
}

export default function ProjectFormModal({ isOpen, project, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description ?? "");
    } else {
      setName("");
      setDescription("");
    }
    setError(null);
  }, [project, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit() {
    if (!name.trim()) { setError("Project name is required."); return; }
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
      onClose();
    } catch {
      setError("Failed to save project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const isEditing = !!project;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isEditing ? "bg-indigo-100 dark:bg-indigo-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"
          }`}>
            {isEditing ? (
              <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {isEditing ? "Edit project" : "New project"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isEditing ? "Update project details" : "Create a new project for your team"}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Project name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Website Redesign"
              value={name}
              onChange={e => setName(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg 
                         bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-shadow"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Description <span className="text-gray-400 font-normal normal-case">(optional)</span>
            </label>
            <textarea
              placeholder="What is this project about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg
                         bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none transition-shadow"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg
                       text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800
                       border border-gray-200 dark:border-gray-700
                       hover:bg-gray-50 dark:hover:bg-gray-700
                       disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg
                       bg-indigo-600 hover:bg-indigo-700 text-white
                       disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : isEditing ? "Save changes" : "Create project"}
          </button>
        </div>
      </div>
    </div>
  );
}