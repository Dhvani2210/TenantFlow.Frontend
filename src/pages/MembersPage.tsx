import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUsers, deleteMember } from "../api/users";
import type { User } from "../types/user";
import type { PagedResult } from "../types/pagedResult";
import InviteMemberModal from "../components/InviteMemberModal";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";

const PAGE_SIZE = 2;

export default function MembersPage() {
  const { user: currentUser } = useAuth();
  const [pagedResult, setPagedResult] = useState<PagedResult<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);

  function setCurrentPage(page: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(page));
      return next;
    });
  }

  function loadMembers(page: number = currentPage) {
    setLoading(true);
    getUsers(page, PAGE_SIZE)
      .then((data) => setPagedResult(data))
      .catch(() => setError("Failed to load members. Please try again."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMembers(currentPage);
  }, [currentPage]);

  const members = pagedResult?.data ?? [];
  const totalPages = pagedResult?.totalPages ?? 1;

  async function handleDeleteMember(id: string) {
    setIsDeleting(true);
    try {
      await deleteMember(id);
      setPagedResult(prev => prev ? { ...prev, data: prev.data.filter(m => m.userId !== id) } : prev);
      setConfirmDelete(null);
    } catch {
      setError("Couldn't delete member. Try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Members</h2>
          {currentUser?.role === "Admin" && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Invite member
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
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading members...</p>
    </div>
  </div>
)}       {error && (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/40 shadow-sm max-w-sm w-full text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Failed to load members</p>
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
        {!loading && !error && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Role</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    {currentUser?.role === "Admin" && <th className="px-6 py-3"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {members.map((member) => (
                    <tr key={member.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{member.fullName}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{member.email}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{member.role}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      {currentUser?.role === "Admin" && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setConfirmDelete(member.userId)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
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
          </>
        )}
      </div>

      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onInvited={() => loadMembers(currentPage)}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        message="Are you sure you want to remove this member?"
        onConfirm={() => confirmDelete && handleDeleteMember(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}