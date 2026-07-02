import { useState } from "react";
import { inviteMember } from "../api/users";

interface Props {
  onClose: () => void;
  onInvited: () => void;
}

type FormErrors = {
  fullName: string;
  email: string;
  role: string;
};

const emptyErrors: FormErrors = {
  fullName: "",
  email: "",
  role: "",
};

export default function InviteMemberModal({ onClose, onInvited }: Props) {
  const [errors, setErrors] = useState<FormErrors | null>(null);
  // Server-side / general errors are kept separate from field-level errors,
  // since they aren't tied to a single input.
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
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear the error for this field as the user edits it.
    setErrors((prev) => ({
      ...(prev ?? emptyErrors),
      [name]: "",
    }));

    // Any further edit means the previous server error is stale.
    if (error) setError(null);
  };

  const validateForm = () => {
    const newErrors: FormErrors = { ...emptyErrors };
    let valid = true;

    // Full Name
    if (!form.fullName.trim()) {
      newErrors.fullName = "Enter their full name";
      valid = false;
    } else if (!/^[A-Za-z ]+$/.test(form.fullName)) {
      newErrors.fullName = "Full name can only contain letters and spaces";
      valid = false;
    }

    // Email
    if (!form.email.trim()) {
      newErrors.email = "Enter their email address";
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      newErrors.email = "Enter a valid email address, like name@company.com";
      valid = false;
    }

    // Role
    if (!form.role) {
      newErrors.role = "Select a role";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) {
          return;
        }

        setErrors(null);
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl w-full max-w-md overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shrink-0">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                Invite member
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Send an invite to join your workspace
                            </p>
                        </div>
                    </div>

                    {!result && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {result ? (
                    <div className="text-center px-6 py-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 mb-4">
                            <svg
                                className="w-6 h-6 text-green-600 dark:text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            <span className="font-semibold">{result.fullName}</span> has been invited
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                            Share this temporary password with them
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 font-mono text-sm text-gray-900 dark:text-white tracking-wider mb-3">
                            {result.temporaryPassword}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                            They should change this password after first login.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-6 flex flex-col gap-5">
                            {error && (
                                <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <svg
                                        className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                    Full name
                                </label>
                                <input
                                    name="fullName"
                                    type="text"
                                    placeholder="Jane Cooper"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${
                                        errors?.fullName
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-200 dark:border-gray-700 focus:ring-indigo-500"
                                    }`}
                                />
                                {errors?.fullName && (
                                    <p className="text-xs text-red-500">{errors.fullName}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                    Email
                                </label>
                                <input
                                    name="email"
                                    placeholder="jane@company.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${
                                        errors?.email
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-200 dark:border-gray-700 focus:ring-indigo-500"
                                    }`}
                                />
                                {errors?.email && (
                                    <p className="text-xs text-red-500">{errors.email}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${
                                        errors?.role
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-200 dark:border-gray-700 focus:ring-indigo-500"
                                    }`}
                                >
                                    <option value="Developer">Developer</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Admin">Admin</option>
                                </select>
                                {errors?.role && (
                                    <p className="text-xs text-red-500">{errors.role}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 text-sm font-semibold rounded-lg
                                           bg-indigo-600 hover:bg-indigo-700
                                           text-white disabled:opacity-50
                                           transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />
                                        </svg>
                                        Inviting...
                                    </>
                                ) : (
                                    "Send invite"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );

}