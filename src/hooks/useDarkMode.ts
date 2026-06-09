import { useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = saved === "dark";
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
    return prefersDark;
  });

  const toggleDark = () => {
    const newIsDark = !isDark;
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
    setIsDark(newIsDark);
  };

  return { isDark, toggleDark };
}