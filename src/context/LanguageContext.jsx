import { createContext, useContext, useMemo, useState } from "react";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem("devtask-language") || "en");
  const toggleLanguage = () => setLanguage((current) => {
    const next = current === "en" ? "fa" : "en";
    localStorage.setItem("devtask-language", next);
    return next;
  });
  const value = useMemo(() => ({ language, isPersian: language === "fa", toggleLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function translate(language, english, persian) {
  return language === "fa" ? persian : english;
}
