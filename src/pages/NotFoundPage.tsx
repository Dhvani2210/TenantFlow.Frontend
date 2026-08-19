import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFoundPage() {
  const { user } = useAuth();
  const destination = user ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm text-center">

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 mb-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
          <div className="h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-blue-500" />

          <div className="px-6 py-10">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Page not found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              The page you're looking for doesn't exist or may have been moved.
            </p>

            <Link
              to={destination}
              className="inline-block w-full py-2.5 text-sm font-semibold rounded-lg
                         bg-indigo-600 hover:bg-indigo-700 text-white
                         transition-colors"
            >
              {user ? "Back to dashboard" : "Back to login"}
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          TenantFlow · Multi-tenant project management
        </p>
      </div>
    </div>
  );
}