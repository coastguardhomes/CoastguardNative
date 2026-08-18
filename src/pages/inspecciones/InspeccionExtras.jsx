import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Asegúrate de importar tu cliente

export default function InspeccionExtras({ inspeccionId, contratoId }) {
  const [extras, setExtras] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');

  useEffect(() => {
    cargarExtras();
  }, [inspeccionId]);

  const cargarExtras = async () => {
    const { data } = await supabase
      .from('extras')
      .select('*')
      .eq('inspeccion_id', inspeccionId);
    if (data) setExtras(data);
  };

  const guardarExtra = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('extras').insert([{
      inspeccion_id: inspeccionId,
      contrato_id: contratoId,
      descripcion,
      precio: parseFloat(precio)
    }]);

    if (!error) {
      setDescripcion('');
      setPrecio('');
      cargarExtras();
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-sm mt-4">
      <h3 className="font-bold mb-2">Servicios Extra</h3>
      <div className="flex gap-2 mb-4">
        <input placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="border p-2 rounded" />
        <input type="number" placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} className="border p-2 rounded" />
        <button onClick={guardarExtra} className="bg-blue-600 text-white px-4 py-2 rounded">Añadir</button>
      </div>
      <ul>
        {extras.map(e => (
          <li key={e.id} className="flex justify-between border-b py-1">
            <span>{e.descripcion}</span>
            <span className="font-bold">{e.precio} €</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

