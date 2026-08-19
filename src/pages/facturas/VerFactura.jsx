  // ⭐ APROBAR PAGO Y ENVIAR AL TÉCNICO
  async function aprobarYEnviarATecnico() {
    try {
      setEnviandoTecnico(true);
      setError("");
      setMensaje("");

      // 1. Actualizar estado de la factura
      const { error: errorUpdate } = await supabase
        .from("facturas")
        .update({ estado: "pagada" })
        .eq("id", id);

      if (errorUpdate) throw new Error("Error actualizando factura: " + errorUpdate.message);

      // 2. Crear el registro en la tabla 'extras' VINCULÁNDOLO AL ID DE LA FACTURA
      const conceptoTexto = factura.descripcion || lineas.map(l => l.concepto).join(", ") || "Servicio Extra Facturado";
      
      const payloadExtra = {
        contrato_id: Number(id), // <--- ¡AÑADE ESTO! Así creas el vínculo
        descripcion: `Factura ${factura.numero || `#${factura.id}`}: ${conceptoTexto}`,
        precio: Number(factura.total || 0),
        estado: "pendiente"
      };

      const { error: errorExtra } = await supabase
        .from("extras")
        .insert([payloadExtra]);

      if (errorExtra) {
        throw new Error("Error en tabla 'extras': " + errorExtra.message);
      }

      setFactura((prev) => ({ ...prev, estado: "pagada" }));
      setMensaje("¡Pago aprobado y servicio enviado al técnico correctamente!");
    } catch (err) {
      console.error("Error al aprobar y enviar:", err);
      setError(err.message);
    } finally {
      setEnviandoTecnico(false);
    }
  }
