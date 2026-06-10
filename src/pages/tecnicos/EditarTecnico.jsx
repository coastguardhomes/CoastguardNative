import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import LayoutWithMenu from "../../layouts/LayoutWithMenu";

export default function EditarTecnico() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from("tecnicos")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setNombre(data.nombre);
        setTelefono(data.telefono);
        setEmail(data.email);
      }
    }

    cargar();
  }, [id]);

  async function guardar(e) {
    e.preventDefault();

    await supabase
      .from("tecnicos")
      .update({ nombre, telefono, email })
      .eq("id", id);

    navigate(`/tecnicos/${id}`);
  }

  return (
    <LayoutWithMenu>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Editar Técnico</h1>

        <form onSubmit={guardar} className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
          />

          <input
            className="w-full p-2 border rounded"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Teléfono"
          />

          <input
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <button className="bg-blue-600 text-white p-2 rounded w-full">
            Guardar cambios
          </button>
        </form>
      </div>
    </LayoutWithMenu>
  );
}