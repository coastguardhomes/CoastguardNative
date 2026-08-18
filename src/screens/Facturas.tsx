import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Linking } from "react-native";
import { obtenerFactura } from "../services/facturas";
import { enviarFactura } from "../services/facturaEnviar";

export default function FacturasScreen({ route }) {
  const { facturaId } = route.params;

  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarFactura();
  }, []);

  async function cargarFactura() {
    setMensaje("");

    try {
      const data = await obtenerFactura(facturaId);

      if (!data) {
        setMensaje("Factura no encontrada");
        return;
      }

      setFactura(data);
    } catch (e) {
      setMensaje("Error cargando factura");
    }

    setLoading(false);
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

      // Recargar datos por si cambia estado
      cargarFactura();
    } catch (e) {
      setMensaje("Error enviando factura");
    }

    setEnviando(false);
  }

  async function handleVerPDF() {
    if (factura && factura.pdf_url) {
      Linking.openURL(factura.pdf_url);
    } else {
      setMensaje("No hay PDF disponible para esta factura");
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
          No se pudo cargar la factura.
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
        <Text style={{ marginTop: 15, color: "#007bff", fontWeight: "bold" }}>
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
          <Text style={{ fontWeight: "bold" }}>Fecha:</Text> {factura.fecha}
        </Text>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Total:</Text> €{factura.total}
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
          style={{
            backgroundColor: "#334155",
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
            Ver PDF
          </Text>
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
