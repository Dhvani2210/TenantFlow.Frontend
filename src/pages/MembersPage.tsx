import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getUsers, deleteMember } from "../api/users";
import type { User } from "../types/user";
import InviteMemberModal from "../components/InviteMemberModal";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";

export default function MembersPage() {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMembers = () => {
    setLoading(true);
    getUsers()
      .then((data) => setMembers(data))
      .catch(() => setError("Failed to load members. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMembers();
  }, []);

  async function handleDeleteMember(id: string) {
    setIsDeleting(true);
    try {
      await deleteMember(id);
      setMembers((prev) => prev.filter((m) => m.userId !== id));
      setConfirmDelete(null);
    } catch {
      setError("Could't delete member. Try Again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Members
          </h2>

          {currentUser?.role === "Admin" && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Invite member
            </button>
          )}
        </div>

        {loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading members...
          </p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  {currentUser?.role === "Admin" && (
                    <th className="px-6 py-3"></th>
                  )}
                 
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {members.map((member) => (
                  <tr
                    key={member.userId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                      {member.fullName}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {member.role}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${member.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                      >
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
        )}
      </div>

      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onInvited={loadMembers}
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
