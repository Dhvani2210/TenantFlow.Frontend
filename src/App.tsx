import { useState } from "react";

function App() {
  const [isDark, setIsDark] = useState(() => {
    // This function runs exactly once — at first render, before anything paints.
    // We read the user's saved preference from localStorage.
    const saved = localStorage.getItem("theme");
    const prefersDark = saved === "dark"; // boolean evaluation 

    // Apply the class to <html> right now, so the page starts
    // in the correct mode without any flash of the wrong theme.
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }

    // Whatever we return here becomes the initial value of isDark.
    return prefersDark;
  });

  const toggleDark = () => {
    const newIsDark = !isDark;

    // Update the DOM
    document.documentElement.classList.toggle("dark", newIsDark);

    // Persist the choice so the next page load remembers it
    localStorage.setItem("theme", newIsDark ? "dark" : "light");

    // Update React state so the button label re-renders
    setIsDark(newIsDark);
  };

  const projects = [
    { id: 1, name: "TenantFlow API", status: "In Progress", tasks: 12 },
    { id: 2, name: "Auth Service", status: "Review", tasks: 5 },
    { id: 3, name: "Frontend Shell", status: "In Progress", tasks: 8 },
    { id: 4, name: "CI/CD Pipeline", status: "Done", tasks: 3 },
    { id: 5, name: "Database Schema", status: "Done", tasks: 7 },
    { id: 6, name: "SignalR Hub", status: "Planned", tasks: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          TenantFlow — Projects
        </h1>
        <button
          onClick={toggleDark}
          className="px-4 py-2 rounded-lg text-sm font-medium
                     bg-gray-200 dark:bg-gray-700
                     text-gray-700 dark:text-gray-200
                     transition-colors duration-300"
        >
          {isDark ? "Light mode" : "Dark mode"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white dark:bg-gray-800
                       border border-gray-200 dark:border-gray-700
                       rounded-xl p-5
                       transition-colors duration-300"
          >
            <h2 className="text-base font-medium text-gray-900 dark:text-white">
              {project.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {project.status}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-3">
              {project.tasks} tasks
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;