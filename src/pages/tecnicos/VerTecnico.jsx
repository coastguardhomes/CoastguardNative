import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import LayoutWithMenu from "../../layouts/LayoutWithMenu";

export default function VerTecnico() {
  const { id } = useParams();
  const [tecnico, setTecnico] = useState(null);

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from("tecnicos")
        .select("*")
        .eq("id", id)
        .single();

      setTecnico(data);
    }

    cargar();
  }, [id]);

  if (!tecnico) return <LayoutWithMenu><p className="p-4">Cargando...</p></LayoutWithMenu>;

  return (
    <LayoutWithMenu>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">{tecnico.nombre}</h1>

        <p><strong>Teléfono:</strong> {tecnico.telefono}</p>
        <p><strong>Email:</strong> {tecnico.email}</p>

        <Link
          to={`/tecnicos/${id}/editar`}
          className="block bg-yellow-500 text-white p-2 rounded mt-4"
        >
          Editar técnico
        </Link>
      </div>
    </LayoutWithMenu>
  );
}