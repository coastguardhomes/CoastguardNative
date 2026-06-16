import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const Inspecciones = () => {
  const [inspecciones, setInspecciones] = useState([]);

  const cargarInspecciones = async () => {
    const { data, error } = await supabase
      .from("inspecciones")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error cargando inspecciones:", error);
      return;
    }

    setInspecciones(data || []);
  };

  useEffect(() => {
    cargarInspecciones();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Inspecciones</h2>

      {inspecciones.length === 0 && <p>No hay inspecciones registradas.</p>}

      {inspecciones.map((insp) => (
        <div
          key={insp.id}
          style={{
            padding: 12,
            marginBottom: 10,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          <p><strong>Cliente:</strong> {insp.cliente}</p>
          <p><strong>Fecha:</strong> {insp.fecha}</p>
          <p><strong>Estado:</strong> {insp.estado}</p>
        </div>
      ))}
    </div>
  );
};

export default Inspecciones;
