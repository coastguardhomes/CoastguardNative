import React, { useEffect, useState } from "react";
import { obtenerFacturas } from "../../services/facturasLista";

export default function EstadisticasFacturas() {
  const [stats, setStats] = useState({
    total: 0,
    pagadas: 0,
    pendientes: 0,
    suma: 0,
  });

  useEffect(() => {
    obtenerFacturas().then((facturas) => {
      const total = facturas.length;
      const pagadas = facturas.filter((f) => f.estado === "pagada").length;
      const pendientes = facturas.filter((f) => f.estado === "pendiente").length;
      const suma = facturas.reduce((acc, f) => acc + f.total, 0);

      setStats({ total, pagadas, pendientes, suma });
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Estadísticas de Facturación</h2>

      <p>Total facturas: {stats.total}</p>
      <p>Pagadas: {stats.pagadas}</p>
      <p>Pendientes: {stats.pendientes}</p>
      <p>Total facturado: €{stats.suma}</p>
    </div>
  );
}
