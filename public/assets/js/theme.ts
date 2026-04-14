// Theme toggle — runs as plain JS in browser (TS for source authoring)
// Persists preference in localStorage, respects prefers-color-scheme

const STORAGE_KEY = "wx-theme" as const;
type Theme = "light" | "";

function getPreferred(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === "light" || saved === "") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "";
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

function init(): void {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") as Theme;
    applyTheme(current === "light" ? "" : "light");
  });
}

document.addEventListener("DOMContentLoaded", init);
