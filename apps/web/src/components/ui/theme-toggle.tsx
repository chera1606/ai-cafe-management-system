"use client";

import { Moon, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check saved theme or system preference
    const saved = localStorage.getItem("cafe_theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("cafe_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="p-2 rounded-xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#141f18] text-forest dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#1e2e23] transition-colors cursor-pointer"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-stone-600" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" />
      )}
    </button>
  );
}
