"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
    console.log("Initial theme set to:", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.className = newTheme;
    localStorage.setItem("theme", newTheme);
    console.log("Theme toggled to:", newTheme);
  };

  if (!isMounted) {
    return null;
  }

 /* return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "🌞" : "🌙"} 
    </button>
  ); */
}