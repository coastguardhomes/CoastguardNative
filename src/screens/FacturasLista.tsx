import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { obtenerFacturas } from "../services/facturasLista";

export default function FacturasListaScreen({ navigation }) {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarFacturas();
  }, []);

  async function cargarFacturas() {
    try {
      const data = await obtenerFacturas();
      setFacturas(data);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <ActivityIndicator size="large" />
        <Text>Cargando facturas...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        padding: 15,
        borderBottomWidth: 1,
        borderColor: "#ccc",
      }}
      onPress={() => navigation.navigate("FacturaDetalle", { facturaId: item.id })}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        Factura #{item.id}
      </Text>
      <Text>Cliente: {item.cliente_nombre}</Text>
      <Text>Total: €{item.total}</Text>
      <Text>Fecha: {item.fecha}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={facturas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}
