import { createContext, useContext, useMemo, useState } from "react";

import en from "../locales/en";
import fa from "../locales/fa";

const LanguageContext = createContext(null);

const translations = {
  en,
  fa,
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("devtask-language");

    return savedLanguage === "fa" ? "fa" : "en";
  });

  const toggleLanguage = () => {
    setLanguage((currentLanguage) => {
      const nextLanguage = currentLanguage === "en" ? "fa" : "en";

      localStorage.setItem("devtask-language", nextLanguage);

      return nextLanguage;
    });
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const value = useMemo(
    () => ({
      language,
      isPersian: language === "fa",
      toggleLanguage,
      t,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Backward compatibility for components that still pass English/Persian pairs.
export function translate(language, english, persian) {
  return language === "fa" ? persian : english;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
