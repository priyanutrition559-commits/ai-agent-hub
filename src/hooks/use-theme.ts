import { useEffect, useState } from "react";
/** Storage is optional: private browsing must not break navigation. */
export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let preference: string | null = null;
      try {
        preference = localStorage.getItem("tu-theme");
      } catch {
        /* Use OS preference. */
      }
      const enabled = preference === "dark" || (preference !== "light" && media.matches);
      setDark(enabled);
      document.documentElement.classList.toggle("dark", enabled);
    };
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("tu-theme", next ? "dark" : "light");
    } catch {
      /* Session-only choice. */
    }
  }
  return { dark, toggle };
}
