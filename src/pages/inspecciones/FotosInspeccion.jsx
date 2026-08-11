  async function subirFoto() {
    try {
      // 📸 Cámara REAL con Capacitor
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (!image.base64String) return;

      const base64 = `data:image/jpeg;base64,${image.base64String}`;
      const blob = await (await fetch(base64)).blob();

      const nombreArchivo = `inspeccion_${id}_${Date.now()}.jpg`;

      const { error: storageError } = await supabase.storage
        .from("fotos")
        .upload(nombreArchivo, blob, {
          contentType: "image/jpeg",
        });

      if (storageError) {
        setMensaje("Error subiendo foto");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("fotos")
        .getPublicUrl(nombreArchivo);

      const nuevaFotoObj = {
        inspeccion_id: id,
        archivo: nombreArchivo,
        url: urlData.publicUrl,
        publicUrl: urlData.publicUrl,
        principal: false,
      };

      const { data: insertedData, error: dbError } = await supabase
        .from("fotos_inspeccion")
        .insert([nuevaFotoObj])
        .select()
        .single();

      if (dbError) {
        setMensaje("Error guardando foto en la base de datos");
        return;
      }

      await supabase
        .from("inspecciones")
        .update({
          fecha_fotos: new Date().toISOString(),
          estado: "fotos_completadas",
        })
        .eq("id", id);

      // ⚡ Actualizamos el estado local al instante para que el botón de continuar funcione ya
      setFotos((prev) => [insertedData ? { ...insertedData, publicUrl: urlData.publicUrl } : nuevaFotoObj, ...prev]);
      setMensaje("Foto subida correctamente");
      
      // Sincronizamos por si acaso de fondo
      cargarFotos();
    } catch (e) {
      console.error(e);
      setMensaje("Error tomando foto");
    }
  }
