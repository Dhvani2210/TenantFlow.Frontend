import { useAuth } from "../context/AuthContext";
import { useDarkMode } from "../hooks/useDarkMode";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleDark } = useDarkMode();

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
        TenantFlow
      </h1>
       <Link to="/dashboard" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          Projects
        </Link>
        {user?.role === "Admin" && (
          <Link to="/members" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            Members
          </Link>
        )}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {user?.role}
        </span>
        <button
          onClick={toggleDark}
          className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors duration-300"
        >
          {isDark ? "Light mode" : "Dark mode"}
        </button>
        <button
          onClick={logout}
          className="text-sm text-red-500 hover:text-red-600"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}