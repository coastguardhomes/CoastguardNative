import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import LayoutWithMenu from "../../layouts/LayoutWithMenu";

export default function TecnicosList() {
  const [tecnicos, setTecnicos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarTecnicos() {
      try {
        const { data, error } = await supabase
          .from("tecnicos")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;

        setTecnicos(data || []);
      } catch (err) {
        console.error("Error cargando técnicos:", err);
      } finally {
        setCargando(false);
      }
    }

    cargarTecnicos();
  }, []);

  return (
    <LayoutWithMenu>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Lista de Técnicos</h1>

        <Link
          to="/tecnicos/nuevo"
          className="bg-blue-600 text-white px-4 py-2 rounded inline-block mb-4"
        >
          + Nuevo Técnico
        </Link>

        {cargando ? (
          <p>Cargando técnicos...</p>
        ) : tecnicos.length === 0 ? (
          <p>No hay técnicos registrados.</p>
        ) : (
          <ul className="space-y-3">
            {tecnicos.map((tec) => (
              <li
                key={tec.id}
                className="p-3 border rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{tec.nombre}</p>
                  <p className="text-sm text-gray-600">{tec.telefono}</p>
                </div>

                <Link
                  to={`/tecnicos/${tec.id}`}
                  className="text-blue-600 underline"
                >
                  Ver
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </LayoutWithMenu>
  );
}