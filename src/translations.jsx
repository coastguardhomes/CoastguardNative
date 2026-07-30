const translations = {
  es: {
    // --- LOGIN ---
    // Faltaban todas estas claves y t() devuelve la clave cuando no existe,
    // así que la pantalla de acceso mostraba literalmente "email",
    // "password" o "login" en lugar de los textos.
    loginSubtitle: "Accede a tu cuenta para continuar",
    email: "Correo electrónico",
    password: "Contraseña",
    login: "Iniciar sesión",
    loggingIn: "Entrando...",
    loginError: "Correo o contraseña incorrectos.",
    loginSinRol:
      "Tu cuenta no tiene un rol asignado. Contacta con un administrador.",
    register: "Crear una cuenta",
    loading: "Cargando...",
    contratoCadaDias: "Cada",

    // --- AJUSTES ---
    ajustes: "Ajustes",
    perfil: "Perfil del usuario",
    idioma: "Cambiar idioma",
    notificaciones: "Notificaciones",
    privacidad: "Privacidad y seguridad",
    cerrarSesion: "Cerrar sesión",
    descripcionAjustes: "Configuración general de tu cuenta y preferencias.",
    seleccionarIdioma: "Selecciona el idioma de la aplicación.",
    espanol: "Español",
    ingles: "Inglés",

    // --- CLIENTE DASHBOARD ---
    clienteDashboardCargando: "Cargando datos del cliente...",
    clienteDashboardNoEncontrado: "No se encontró información del cliente.",
    clienteDashboardTitulo: "Panel del Cliente",
    clienteDashboardNombre: "Nombre",
    clienteDashboardEmail: "Email",
    clienteDashboardTelefono: "Teléfono",
    clienteDashboardVerViviendas: "Ver mis viviendas",

    // --- LISTA DE CONTRATOS ---
    clienteListaTitulo: "Contratos de Clientes",
    clienteListaVacio: "No hay contratos registrados.",
    clienteListaCliente: "Cliente",
    clienteListaDireccion: "Dirección",
    clienteListaServicio: "Servicio",
    clienteListaPrecio: "Precio",
    clienteDesconocido: "Cliente desconocido",
    clienteSinDireccion: "Sin dirección",

    // --- VER CONTRATO ---
    clienteContratoCargando: "Cargando contrato...",
    clienteContratoTitulo: "Contrato del Cliente",
    clienteContratoDatosCliente: "Datos del Cliente",
    clienteContratoNombre: "Nombre",
    clienteContratoDireccion: "Dirección",
    clienteContratoTelefono: "Teléfono",
    clienteContratoDetalles: "Detalles del Contrato",
    clienteContratoTipoServicio: "Tipo de servicio",
    clienteContratoPrecioMensual: "Precio mensual",
    clienteContratoFechaInicio: "Fecha inicio",
    clienteContratoPrecioNoDisponible: "Precio no disponible",
    clienteContratoEditar: "Editar contrato",

    // --- FIRMA ---
    clienteFirmaTitulo: "Firma del Cliente",
    clienteFirmaGuardar: "Guardar firma",
    clienteFirmaLimpiar: "Limpiar",

    // --- PDF GENERAR ---
    pdfTitulo: "Contrato de Servicio CoastGuard",
    pdfNombreCliente: "Nombre del cliente",
    pdfDireccion: "Dirección",
    pdfTelefono: "Teléfono",
    pdfDetallesServicio: "Detalles del servicio:",
    pdfTipoServicio: "Tipo de servicio",
    pdfFechaInicio: "Fecha de inicio",
    pdfPrecioMensual: "Precio mensual",
    pdfCondiciones: "Condiciones generales:",
    pdfCondicionesTexto:
      "El cliente acepta las condiciones del servicio CoastGuard según lo acordado.",
    pdfFirmaCliente: "Firma del cliente",
    pdfGenerado: "PDF generado y guardado correctamente.",
    pdfGenerando: "Generando PDF...",
    pdfGenerar: "Generar PDF del contrato",

    // --- PDF VER ---
    pdfCargando: "Cargando PDF...",
    pdfNoGenerado: "El contrato no tiene PDF generado.",
    pdfTituloVista: "Contrato PDF",
    pdfVolver: "Volver",
    pdfTituloIframe: "PDF del contrato",
    pdfAbrirNuevaPestana: "Abrir en nueva pestaña",
  },

  en: {
    // --- LOGIN ---
    loginSubtitle: "Sign in to your account to continue",
    email: "Email address",
    password: "Password",
    login: "Sign in",
    loggingIn: "Signing in...",
    loginError: "Incorrect email or password.",
    loginSinRol: "Your account has no role assigned. Contact an administrator.",
    register: "Create an account",
    loading: "Loading...",
    contratoCadaDias: "Every",

    // --- SETTINGS ---
    ajustes: "Settings",
    perfil: "User Profile",
    idioma: "Change Language",
    notificaciones: "Notifications",
    privacidad: "Privacy & Security",
    cerrarSesion: "Log out",
    descripcionAjustes: "General configuration of your account and preferences.",
    seleccionarIdioma: "Select the application language.",
    espanol: "Spanish",
    ingles: "English",

    // --- CLIENT DASHBOARD ---
    clienteDashboardCargando: "Loading client data...",
    clienteDashboardNoEncontrado: "Client information not found.",
    clienteDashboardTitulo: "Client Dashboard",
    clienteDashboardNombre: "Name",
    clienteDashboardEmail: "Email",
    clienteDashboardTelefono: "Phone",
    clienteDashboardVerViviendas: "View my properties",

    // --- CONTRACT LIST ---
    clienteListaTitulo: "Client Contracts",
    clienteListaVacio: "No contracts registered.",
    clienteListaCliente: "Client",
    clienteListaDireccion: "Address",
    clienteListaServicio: "Service",
    clienteListaPrecio: "Price",
    clienteDesconocido: "Unknown client",
    clienteSinDireccion: "No address",

    // --- VIEW CONTRACT ---
    clienteContratoCargando: "Loading contract...",
    clienteContratoTitulo: "Client Contract",
    clienteContratoDatosCliente: "Client Information",
    clienteContratoNombre: "Name",
    clienteContratoDireccion: "Address",
    clienteContratoTelefono: "Phone",
    clienteContratoDetalles: "Contract Details",
    clienteContratoTipoServicio: "Service type",
    clienteContratoPrecioMensual: "Monthly price",
    clienteContratoFechaInicio: "Start date",
    clienteContratoPrecioNoDisponible: "Price not available",
    clienteContratoEditar: "Edit contract",

    // --- SIGNATURE ---
    clienteFirmaTitulo: "Client Signature",
    clienteFirmaGuardar: "Save signature",
    clienteFirmaLimpiar: "Clear",

    // --- PDF GENERATE ---
    pdfTitulo: "CoastGuard Service Contract",
    pdfNombreCliente: "Client name",
    pdfDireccion: "Address",
    pdfTelefono: "Phone",
    pdfDetallesServicio: "Service details:",
    pdfTipoServicio: "Service type",
    pdfFechaInicio: "Start date",
    pdfPrecioMensual: "Monthly price",
    pdfCondiciones: "General conditions:",
    pdfCondicionesTexto:
      "The client accepts the CoastGuard service conditions as agreed.",
    pdfFirmaCliente: "Client signature",
    pdfGenerado: "PDF generated and saved successfully.",
    pdfGenerando: "Generating PDF...",
    pdfGenerar: "Generate contract PDF",

    // --- PDF VIEW ---
    pdfCargando: "Loading PDF...",
    pdfNoGenerado: "This contract has no generated PDF.",
    pdfTituloVista: "Contract PDF",
    pdfVolver: "Go back",
    pdfTituloIframe: "Contract PDF",
    pdfAbrirNuevaPestana: "Open in new tab",
  },
};

export default translations;
