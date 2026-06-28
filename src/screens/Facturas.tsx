import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import { obtenerFactura } from "../services/facturas";
import { enviarFactura } from "../services/facturaEnviar";

export default function FacturasScreen({ route }) {
  const { facturaId } = route.params;
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarFactura();
  }, []);

  async function cargarFactura() {
    try {
      const data = await obtenerFactura(facturaId);
      setFactura(data);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }

  async function handleEnviar() {
    setEnviando(true);
    try {
      await enviarFactura(factura.id);
      alert("Factura enviada correctamente");
    } catch (e) {
      alert("Error enviando factura");
      console.log(e);
    }
    setEnviando(false);
  }

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <ActivityIndicator size="large" />
        <Text>Cargando factura...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Factura #{factura.id}
      </Text>

      <View style={{ marginTop: 20 }}>
        <Text><Text style={{ fontWeight: "bold" }}>Cliente:</Text> {factura.cliente_nombre}</Text>
        <Text><Text style={{ fontWeight: "bold" }}>Email:</Text> {factura.cliente_email}</Text>
        <Text><Text style={{ fontWeight: "bold" }}>Fecha:</Text> {factura.fecha}</Text>
        <Text><Text style={{ fontWeight: "bold" }}>Total:</Text> €{factura.total}</Text>
      </View>

      <View style={{ marginTop: 40 }}>
        {enviando ? (
          <ActivityIndicator size="large" />
        ) : (
          <Button title="Enviar factura por email" onPress={handleEnviar} />
        )}
      </View>
    </View>
  );
}
