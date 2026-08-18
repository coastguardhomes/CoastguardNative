  const generarPDF = async (id) => {
    try {
      setGenerandoId(id);

      const response = await supabase.functions.invoke("contrato-pdf", {
        body: { contratoId: id },
      });

      if (response.error) throw response.error;

      const rawData = response.data;
      
      // Intentamos extraer la URL real que DEBERÍA devolver la Edge Function
      const urlGenerada = rawData?.pdf_url || rawData?.url || rawData?.path;

      // SI NO HAY URL, NO GUARDAMOS NADA.
      if (!urlGenerada) {
        throw new Error("La función generadora no devolvió una URL válida. Verifica que la Edge Function esté guardando el archivo en Storage.");
      }

      // Si tenemos URL real, actualizamos la base de datos
      const { error: updateError } = await supabase
        .from("contratos")
        .update({ pdf_url: urlGenerada })
        .eq("id", id);

      if (updateError) {
        throw new Error("Error al guardar la URL en la base de datos: " + updateError.message);
      }

      await cargarContratos();
      alert("¡PDF generado y vinculado con éxito!");

    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert("Error: " + (err.message || "No se pudo generar el PDF. Revisa la consola de Supabase."));
    } finally {
      setGenerandoId(null);
    }
  };
