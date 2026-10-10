import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import { obtenerFactura } from "../services/facturas";
import { enviarFactura } from "../services/facturaEnviar";
import { resolverUrlPdfSegura } from "../lib/urlPdf";

export default function FacturasScreen({ route }) {
  const { facturaId } = route.params;

  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [abriendoPDF, setAbriendoPDF] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarFactura();
  }, [facturaId]);

  async function cargarFactura() {
    setMensaje("");
    setLoading(true);

    try {
      const data = await obtenerFactura(facturaId);

      if (!data) {
        setFactura(null);
        setMensaje("Factura no encontrada");
        return;
      }

      setFactura(data);
    } catch (e) {
      console.error("Error cargando factura:", e);
      setFactura(null);
      setMensaje("Error cargando factura");
    } finally {
      setLoading(false);
    }
  }

  async function handleEnviar() {
    if (!factura) {
      setMensaje("Factura inválida");
      return;
    }

    setEnviando(true);
    setMensaje("");

    try {
      await enviarFactura(factura.id);
      setMensaje("Factura enviada correctamente");

      // Recargar los datos por si cambia el estado.
      await cargarFactura();
    } catch (e) {
      console.error("Error enviando factura:", e);
      setMensaje("Error enviando factura");
    } finally {
      setEnviando(false);
    }
  }

  async function handleVerPDF() {
    if (!factura || (!factura.pdf_storage_path && !factura.pdf_url)) {
      setMensaje("No hay PDF disponible para esta factura");
      return;
    }

    setAbriendoPDF(true);
    setMensaje("");

    try {
      // Priorizar la ruta interna del archivo, si existe.
      // Mantener compatibilidad con las URL antiguas.
      const referenciaPDF =
        factura.pdf_storage_path || factura.pdf_url;

      const url = await resolverUrlPdfSegura(
        referenciaPDF,
        "facturas",
        3600
      );

      if (!url) {
        throw new Error(
          "No se pudo generar el enlace del PDF. Comprueba los permisos de acceso a la factura."
        );
      }

      await Linking.openURL(url);
    } catch (e) {
      console.error("Error abriendo PDF de factura:", e);

      setMensaje(
        e?.message || "No se pudo abrir el PDF de la factura"
      );
    } finally {
      setAbriendoPDF(false);
    }
  }

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <ActivityIndicator size="large" />
        <Text>Cargando factura...</Text>
      </View>
    );
  }

  if (!factura) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, color: "red" }}>
          {mensaje || "No se pudo cargar la factura."}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Factura #{factura.id}
      </Text>

      {mensaje !== "" && (
        <Text
          style={{
            marginTop: 15,
            color: "#007bff",
            fontWeight: "bold",
          }}
        >
          {mensaje}
        </Text>
      )}

      <View style={{ marginTop: 20 }}>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Cliente:</Text>{" "}
          {factura.cliente_nombre}
        </Text>

        <Text>
          <Text style={{ fontWeight: "bold" }}>Email:</Text>{" "}
          {factura.cliente_email}
        </Text>

        <Text>
          <Text style={{ fontWeight: "bold" }}>Fecha:</Text>{" "}
          {factura.fecha}
        </Text>

        <Text>
          <Text style={{ fontWeight: "bold" }}>Total:</Text>{" "}
          €{factura.total}
        </Text>

        <Text>
          <Text style={{ fontWeight: "bold" }}>Estado:</Text>{" "}
          {factura.estado || "Pendiente"}
        </Text>
      </View>

      {/* Botón para ver el PDF de la factura */}
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity
          onPress={handleVerPDF}
          disabled={abriendoPDF}
          style={{
            backgroundColor: "#334155",
            padding: 15,
            borderRadius: 10,
            opacity: abriendoPDF ? 0.6 : 1,
          }}
        >
          {abriendoPDF ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Ver PDF
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 20 }}>
        {enviando ? (
          <ActivityIndicator size="large" />
        ) : (
          <TouchableOpacity
            onPress={handleEnviar}
            style={{
              backgroundColor: "#007bff",
              padding: 15,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Enviar factura por email
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
