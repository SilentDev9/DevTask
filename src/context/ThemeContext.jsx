import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export const themes = [
  { id: "default", name: "Default", label: "پیش‌فرض", color: "#8b5cf6" },
  { id: "midnight", name: "Midnight Purple", label: "بنفش نیمه‌شب", color: "#9b8cff" },
  { id: "ocean", name: "Deep Ocean", label: "اقیانوس عمیق", color: "#38bdf8" },
  { id: "emerald", name: "Emerald Night", label: "زمردی", color: "#34d399" },
  { id: "arctic", name: "Arctic Blue", label: "آبی قطبی", color: "#67e8f9" },
  { id: "rose", name: "Rosewood", label: "رز چوبی", color: "#fb7185" },
  { id: "cyberpunk", name: "Cyberpunk", label: "سایبرپانک", color: "#e879f9" },
  { id: "sunset", name: "Sunset", label: "غروب", color: "#fb923c" },
  { id: "nord", name: "Nord", label: "نورد", color: "#88c0d0" },
  { id: "dracula", name: "Dracula", label: "دراکولا", color: "#bd93f9" },
  { id: "light", name: "Light Minimal", label: "روشن مینیمال", color: "#6366f1" },
];

export const backgrounds = [
  { id: "none", name: "None", label: "بدون پس‌زمینه" },
  { id: "aurora", name: "Aurora", label: "شفق قطبی" },
  { id: "orbs", name: "Floating Orbs", label: "گوی‌های شناور" },
  { id: "grid", name: "Neon Grid", label: "شبکه نئونی" },
  { id: "waves", name: "Liquid Waves", label: "موج‌های مایع" },
  { id: "mesh", name: "Mesh Gradient", label: "گرادیان مش" },
  { id: "starfield", name: "Starfield", label: "آسمان ستاره‌ای" },
  { id: "particles", name: "Soft Particles", label: "ذرات شناور" },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("devtask-theme") || "default");
  const [background, setBackground] = useState(() => localStorage.getItem("devtask-background") || "aurora");

  useEffect(() => {
    const valid = themes.some((item) => item.id === theme) ? theme : "default";
    document.documentElement.dataset.theme = valid;
    localStorage.setItem("devtask-theme", valid);
  }, [theme]);

  useEffect(() => {
    const valid = backgrounds.some((item) => item.id === background) ? background : "aurora";
    document.documentElement.dataset.background = valid;
    localStorage.setItem("devtask-background", valid);
  }, [background]);

  const value = useMemo(() => ({ theme, setTheme, background, setBackground }), [theme, background]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
