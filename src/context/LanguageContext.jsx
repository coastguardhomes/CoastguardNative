import React, { createContext, useContext, useState, useEffect } from "react";
import translations from "../translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("es");

  useEffect(() => {
    const saved = localStorage.getItem("idioma");
    if (saved) setLang(saved);
  }, []);

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
