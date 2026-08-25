import React, { createContext, useContext, useState } from 'react';

const translations = {
  es: {
    bienvenida: "Bienvenido a tu panel de cliente",
    misViviendas: "Mis Viviendas",
    serviciosExtras: "Servicios Extras",
    facturas: "Facturas y Pagos",
    perfil: "Mi Perfil",
    cerrarSesion: "Cerrar Sesión",
    noHayDatos: "No hay registros disponibles.",
    cambiarIdioma: "Idioma",
    verDetalles: "Ver Detalles",
    estadoPendiente: "Pendiente",
    estadoAprobado: "Aprobado",
    estadoCompletado: "Completado",
    solicitarExtra: "Solicitar Servicio Extra",
    totalPagar: "Total a Pagar",
    direccion: "Dirección",
  },
  en: {
    bienvenida: "Welcome to your client dashboard",
    misViviendas: "My Properties",
    serviciosExtras: "Extra Services",
    facturas: "Invoices & Payments",
    perfil: "My Profile",
    cerrarSesion: "Log Out",
    noHayDatos: "No records available.",
    cambiarIdioma: "Language",
    verDetalles: "View Details",
    estadoPendiente: "Pending",
    estadoAprobado: "Approved",
    estadoCompletado: "Completed",
    solicitarExtra: "Request Extra Service",
    totalPagar: "Total Due",
    direccion: "Address",
  },
  fr: {
    bienvenida: "Bienvenue sur votre tableau de bord client",
    misViviendas: "Mes Propriétés",
    serviciosExtras: "Services Supplémentaires",
    facturas: "Factures et Paiements",
    perfil: "Mon Profil",
    cerrarSesion: "Se Déconnecter",
    noHayDatos: "Aucun enregistrement disponible.",
    cambiarIdioma: "Langue",
    verDetalles: "Voir les détails",
    estadoPendiente: "En attente",
    estadoAprobado: "Approuvé",
    estadoCompletado: "Terminé",
    solicitarExtra: "Demander un service supplémentaire",
    totalPagar: "Total à payer",
    direccion: "Adresse",
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'es');

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['es'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Exportamos ambos nombres para compatibilidad total con cualquier componente
export const useTranslation = () => useContext(LanguageContext);
export const useLanguage = () => useContext(LanguageContext);
