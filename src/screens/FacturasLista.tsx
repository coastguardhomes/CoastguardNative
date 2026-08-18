import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase'; // Ajusta la ruta a tu cliente de Supabase

export default function FacturasLista() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('facturas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error al cargar facturas:", error);
      } else {
        setFacturas(data || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Facturas', { facturaId: item.id })}
    >
      <Text style={styles.titulo}>Nº Factura: {item.id}</Text>
      <Text style={styles.texto}>Fecha: {new Date(item.created_at).toLocaleDateString()}</Text>
      <Text style={styles.total}>Total: {item.total} €</Text>
      <Text style={styles.texto}>Estado: {item.estado || 'Pendiente'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Mis Facturas</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#38bdf8" />
      ) : (
        <FlatList
          data={facturas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={{color: '#fff', textAlign: 'center'}}>No hay facturas disponibles.</Text>}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Botón flotante para navegar a crear nuevos extras */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ExtrasScreen')} 
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f172a' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  card: { 
    backgroundColor: '#1e293b', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155'
  },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#38bdf8' },
  total: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginVertical: 5 },
  texto: { color: '#cbd5e1' },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 30,
    backgroundColor: '#007bff',
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: { fontSize: 30, color: 'white', fontWeight: 'bold' }
});
