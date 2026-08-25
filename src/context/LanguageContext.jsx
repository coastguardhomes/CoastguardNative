import React, { createContext, useContext, useState } from 'react';

const translations = {
  es: {
    // Generales / Dashboard
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

    // Configuración y Seguridad
    configuracionYSeguridad: "Configuración y Seguridad",
    volver: "← Volver",
    preferenciasNotificacion: "Preferencias de Notificación",
    notifPushTitulo: "Notificaciones Push",
    notifPushSub: "Recibe avisos inmediatos en la app sobre tus inspecciones.",
    resumenCorreoTitulo: "Resumen por Correo",
    resumenCorreoSub: "Recibe informes y facturas directamente en tu email.",
    alertasCriticasTitulo: "Alertas de Incidencias Críticas",
    alertasCriticasSub: "Avisos urgentes de incidencias graves detectadas en viviendas.",
    seguridadCuenta: "Seguridad de la Cuenta",
    autenticacionDosPasosTitulo: "Autenticación en 2 Pasos (2FA)",
    autenticacionDosPasosSub: "Añade un nivel extra de seguridad al iniciar sesión.",
    contrasena: "Contraseña",
    ultimoCambioContrasena: "Último cambio hace más de 30 días",
    cambiar: "Cambiar",
    alertaCambiarContrasena: "Función para cambiar contraseña",
    cambiosGuardados: "✓ Cambios Guardados",
    guardarPreferencias: "Guardar Preferencias",
  },
  en: {
    // General / Dashboard
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

    // Configuration & Security
    configuracionYSeguridad: "Configuration & Security",
    volver: "← Back",
    preferenciasNotificacion: "Notification Preferences",
    notifPushTitulo: "Push Notifications",
    notifPushSub: "Receive immediate notices in the app about your inspections.",
    resumenCorreoTitulo: "Email Summary",
    resumenCorreoSub: "Receive reports and invoices directly in your email.",
    alertasCriticasTitulo: "Critical Incident Alerts",
    alertasCriticasSub: "Urgent notices of severe incidents detected in properties.",
    seguridadCuenta: "Account Security",
    autenticacionDosPasosTitulo: "Two-Factor Authentication (2FA)",
    autenticacionDosPasosSub: "Add an extra level of security when logging in.",
    contrasena: "Password",
    ultimoCambioContrasena: "Last changed more than 30 days ago",
    cambiar: "Change",
    alertaCambiarContrasena: "Password change feature",
    cambiosGuardados: "✓ Changes Saved",
    guardarPreferencias: "Save Preferences",
  },
  fr: {
    // Général / Tableau de bord
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

    // Configuration & Sécurité
    configuracionYSeguridad: "Configuration & Sécurité",
    volver: "← Retour",
    preferenciasNotificacion: "Préférences de notification",
    notifPushTitulo: "Notifications push",
    notifPushSub: "Recevez des avis immédiats dans l'application sur vos inspections.",
    resumenCorreoTitulo: "Résumé par e-mail",
    resumenCorreoSub: "Recevez des rapports et factures directement dans votre e-mail.",
    alertasCriticasTitulo: "Alertas d'incidents critiques",
    alertasCriticasSub: "Avis urgents d'incidents graves détectés dans les logements.",
    seguridadCuenta: "Sécurité du compte",
    autenticacionDosPasosTitulo: "Authentification à 2 facteurs (2FA)",
    autenticacionDosPasosSub: "Ajoutez un niveau de sécurité supplémentaire lors de la connexion.",
    contrasena: "Mot de passe",
    ultimoCambioContrasena: "Dernière modification il y a plus de 30 jours",
    cambiar: "Modifier",
    alertaCambiarContrasena: "Fonction de changement de mot de passe",
    cambiosGuardados: "✓ Modifications enregistrées",
    guardarPreferencias: "Enregistrer les préférences",
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

// Exportamos ambos alias para compatibilidad total
export const useTranslation = () => useContext(LanguageContext);
export const useLanguage = () => useContext(LanguageContext);
