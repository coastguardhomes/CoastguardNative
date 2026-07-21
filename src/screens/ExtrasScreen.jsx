import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { createExtraInvoice } from '../services/extras';
import BotonMarcarPagada from '../components/BotonMarcarPagada';

export default function ExtrasScreen({ route, navigation }) {
  const { clienteId, propiedadId } = route.params;

  const [extras, setExtras] = useState({
    apertura: false,
    cierre: false,
    supervision: false,
    gestionTecnico: false,
    presupuesto: false,
    materiales: false,
    paqueteria: false,
    emergencia: false,
    tecnico: false
  });

  const [horas, setHoras] = useState('');
  const [precioTecnico, setPrecioTecnico] = useState('');
  const [materiales, setMateriales] = useState('');
  const [facturaId, setFacturaId] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const toggle = (key) => {
    setExtras({ ...extras, [key]: !extras[key] });
  };

  const calcularTotal = () => {
    let total = 0;

    if (extras.apertura) total += 30;
    if (extras.cierre) total += 30;
    if (extras.gestionTecnico) total += 25;
    if (extras.supervision) total += (parseFloat(horas) || 0) * 35;
    if (extras.presupuesto) total += parseFloat(precioTecnico) || 0;
    if (extras.tecnico) total += parseFloat(precioTecnico) || 0;
    if (extras.materiales) total += parseFloat(materiales) || 0;
    if (extras.paqueteria) total += 15;
    if (extras.emergencia) total += 50;

    return total;
  };

  const crearFactura = async () => {
    const id = await createExtraInvoice({
      clienteId,
      propiedadId,
      extras,
      horas: parseFloat(horas) || 0,
      precioTecnico: parseFloat(precioTecnico) || 0,
      materiales: parseFloat(materiales) || 0,
      total: calcularTotal()
    });

    if (!id) {
      setMensaje("Error creando factura");
      return;
    }

    setFacturaId(id);
    setMensaje("Factura creada correctamente");
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: '#fff'
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Extras CoastGuard</Text>

      {mensaje !== '' && (
        <Text style={{ marginTop: 15, color: '#007bff', fontWeight: 'bold' }}>
          {mensaje}
        </Text>
      )}

      <TouchableOpacity onPress={() => toggle('apertura')}>
        <Text style={{ marginTop: 20 }}>Apertura (30€): {extras.apertura ? 'Sí' : 'No'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => toggle('cierre')}>
        <Text style={{ marginTop: 20 }}>Cierre (30€): {extras.cierre ? 'Sí' : 'No'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => toggle('supervision')}>
        <Text style={{ marginTop: 20 }}>Supervisión (35€/hora): {extras.supervision ? 'Sí' : 'No'}</Text>
      </TouchableOpacity>

      {extras.supervision && (
        <>
          <Text style={{ marginTop: 10 }}>Horas de supervisión</Text>
          <TextInput
            style={inputStyle}
            keyboardType="numeric"
            value={horas}
            onChangeText={setHoras}
          />
        </>
      )}

      <TouchableOpacity onPress={() => toggle('gestionTecnico')}>
        <Text style={{ marginTop: 20 }}>Gestión técnico (25€): {extras.gestionTecnico ? 'Sí' : 'No'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => toggle('presupuesto')}>
        <Text style={{ marginTop: 20 }}>Solicitar presupuesto: {extras.presupuesto ? 'Sí' : 'No'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => toggle('tecnico')}>
        <Text style={{ marginTop: 20 }}>Técnico: {extras.tecnico ? 'Sí' : 'No'}</Text>
      </TouchableOpacity>

      {(extras.presupuesto || extras.tecnico) && (
        <>
          <Text style={{ marginTop: 10 }}>Precio técnico (€)</Text>
          <TextInput
            style={inputStyle}
            keyboardType="numeric"
            value={precioTecnico}
            onChangeText={setPrecioTecnico}
          />
        </>
      )}

      <TouchableOpacity onPress={() => toggle('materiales')}>
        <Text style={{ marginTop: 20 }}>Materiales: {extras.materiales ? 'Sí' : 'No'}</Text>
      </TouchableOpacity>

      {extras.materiales && (
        <>
          <Text style={{ marginTop: 10 }}>Materiales (€)</Text>
          <TextInput
            style={inputStyle}
            keyboardType="numeric"
            value={materiales}
            onChangeText={setMateriales}
          />
        </>
      )}

      <TouchableOpacity onPress={() => toggle('paqueteria')}>
        <Text style={{ marginTop: 20 }}>Paquetería (15€): {extras.paqueteria ? 'Sí' : 'No'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => toggle('emergencia')}>
        <Text style={{ marginTop: 20 }}>Emergencia (50€): {extras.emergencia ? 'Sí' : 'No'}</Text>
      </TouchableOpacity>

      <Text style={{
        fontSize: 22,
        marginVertical: 20,
        backgroundColor: '#eef6ff',
        padding: 15,
        borderRadius: 10,
        borderColor: '#007bff',
        borderWidth: 1
      }}>
        Total: {calcularTotal()} €
      </Text>

      <TouchableOpacity
        onPress={crearFactura}
        style={{
          backgroundColor: '#007bff',
          padding: 15,
          borderRadius: 10
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontSize: 18 }}>
          Crear factura
        </Text>
      </TouchableOpacity>

      {facturaId && (
        <BotonMarcarPagada facturaId={facturaId} navigation={navigation} />
      )}
    </ScrollView>
  );
}
