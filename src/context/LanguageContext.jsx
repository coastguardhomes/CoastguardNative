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
    // Nuevas claves para el Dashboard Cliente
    cargandoPanel: "Cargando Panel...",
    panelDeControl: "Panel de Control",
    dashboardCliente: "Dashboard Cliente",
    operativo: "Operativo",
    trabajosExtrasDisponibles: "¡Trabajos Extras Disponibles!",
    tienes: "Tienes",
    trabajosRegistrados: "trabajos o informes extras registrados.",
    trabajoExtraFactura: "Trabajo Extra / Factura",
    verDetallesFotosFacturas: "Ver detalles y fotos en facturas",
    verFactura: "Ver Factura →",
    inspecciones: "Inspecciones",
    alertas: "Alertas",
    viviendas: "Viviendas",
    inspeccionesDiarias: "Inspecciones Diarias",
    configuracionSeguridadNotificaciones: "Configuración de Seguridad y Notificaciones",
    lun: "Lun",
    mar: "Mar",
    mie: "Mié",
    jue: "Jue",
    vie: "Vie",
    sab: "Sáb",
    dom: "Dom",
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
    // New keys for Client Dashboard
    cargandoPanel: "Loading Dashboard...",
    panelDeControl: "Control Panel",
    dashboardCliente: "Client Dashboard",
    operativo: "Operational",
    trabajosExtrasDisponibles: "Extra Jobs Available!",
    tienes: "You have",
    trabajosRegistrados: "extra jobs or reports registered.",
    trabajoExtraFactura: "Extra Job / Invoice",
    verDetallesFotosFacturas: "View details and photos in invoices",
    verFactura: "View Invoice →",
    inspecciones: "Inspections",
    alertas: "Alerts",
    viviendas: "Properties",
    inspeccionesDiarias: "Daily Inspections",
    configuracionSeguridadNotificaciones: "Security and Notification Settings",
    lun: "Mon",
    mar: "Tue",
    mie: "Wed",
    jue: "Thu",
    vie: "Fri",
    sab: "Sat",
    dom: "Sun",
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
    // Nouvelles clés pour le tableau de bord client
    cargandoPanel: "Chargement du tableau de bord...",
    panelDeControl: "Panneau de contrôle",
    dashboardCliente: "Tableau de bord client",
    operativo: "Opérationnel",
    trabajosExtrasDisponibles: "Travaux supplémentaires disponibles !",
    tienes: "Vous avez",
    trabajosRegistrados: "travaux ou rapports supplémentaires enregistrés.",
    trabajoExtraFactura: "Travail supplémentaire / Facture",
    verDetallesFotosFacturas: "Voir les détails et photos dans les factures",
    verFactura: "Voir la facture →",
    inspecciones: "Inspections",
    alertas: "Alertes",
    viviendas: "Propriétés",
    inspeccionesDiarias: "Inspections quotidiennes",
    configuracionSeguridadNotificaciones: "Paramètres de sécurité et de notification",
    lun: "Lun",
    mar: "Mar",
    mie: "Mer",
    jue: "Jeu",
    vie: "Ven",
    sab: "Sam",
    dom: "Dim",
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

export const useTranslation = () => useContext(LanguageContext);
export const useLanguage = () => useContext(LanguageContext);
