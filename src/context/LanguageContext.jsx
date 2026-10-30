
export function LanguageProvider({ children }) {
  const { user, role } = useAuth();

  const [language, setLanguage] = useState("es");
  const [loadedFor, setLoadedFor] = useState(null);

  const accountKey = user?.id
    ? `app_idioma_${user.id}`
    : "app_idioma";

  useEffect(() => {
    let cancelado = false;

    async function cargarIdioma() {
      if (user?.id && !role) {
        setLoadedFor(null);
        return;
      }

      let idiomaGuardado = null;

      try {
        idiomaGuardado = localStorage.getItem(accountKey);
      } catch (error) {
        console.error("Error leyendo idioma local:", error);
      }

      if (user?.id && role === "cliente") {
        try {
          const { data, error } = await supabase
            .from("clientes")
            .select("idioma")
            .eq("usuario_id", user.id)
            .maybeSingle();

          if (cancelado) return;

          if (error) {
            console.error("Error recuperando idioma del cliente:", error);
          } else if (data?.idioma === "en" || data?.idioma === "es") {
            idiomaGuardado = data.idioma;
          } else {
            const resultado = await supabase
              .from("clientes")
              .select("idioma")
              .eq("user_id", user.id)
              .maybeSingle();

            if (cancelado) return;

            if (!resultado.error &&
                (resultado.data?.idioma === "en" ||
                 resultado.data?.idioma === "es")) {
              idiomaGuardado = resultado.data.idioma;
            }
          }
        } catch (error) {
          console.error("Error consultando idioma del cliente:", error);
        }
      }

      if (cancelado) return;

      const idiomaInicial = idiomaGuardado === "en" ? "en" : "es";

      setLanguage(idiomaInicial);
      setLoadedFor(accountKey);

      try {
        localStorage.setItem(accountKey, idiomaInicial);
      } catch (error) {
        console.error("Error guardando idioma local:", error);
      }
    }

    cargarIdioma();

    return () => {
      cancelado = true;
    };
  }, [user?.id, role, accountKey]);

  useEffect(() => {
    if (loadedFor !== accountKey) return;
    if (user?.id && !role) return;

    try {
      localStorage.setItem(accountKey, language);
    } catch (error) {
      console.error("Error guardando preferencia de idioma:", error);
    }
  }, [language, loadedFor, accountKey, user?.id, role]);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const t = (key) => {
    const dict = translations[language] || translations.es;
    return dict[key] || translations.es[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
