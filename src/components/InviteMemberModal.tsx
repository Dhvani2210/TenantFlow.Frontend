import { useState } from "react";
import { inviteMember } from "../api/users";

interface Props {
  onClose: () => void;
  onInvited: () => void;
}

export default function InviteMemberModal({ onClose, onInvited }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    role: "Developer",
  });
  const [result, setResult] = useState<{
    fullName: string;
    temporaryPassword: string;
  } | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const response = await inviteMember(form);
            setResult({ fullName: response.fullName, temporaryPassword: response.temporaryPassword });
            onInvited();
        } catch (err: any) {
            setError(err.response?.data?.error ?? "Failed to invite member.");
        } finally {
            setLoading(false);
        }
  };



   return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Invite member
                </h2>

                {result ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{result.fullName}</span> has been invited. Share this temporary password with them:
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 font-mono text-sm text-gray-900 dark:text-white tracking-wider">
                            {result.temporaryPassword}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            They should change this password after first login.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full name
                            </label>
                            <input
                                name="fullName"
                                type="text"
                                required
                                value={form.fullName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Role
                            </label>
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Developer">Developer</option>
                                <option value="Manager">Manager</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                {loading ? "Inviting..." : "Send invite"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );

}
