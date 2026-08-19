import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Importante para validar propiedad
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";

export default function ClienteInspeccionVer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Usamos el usuario para validar seguridad
  
  const [inspeccion, setInspeccion] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [fotoModal, setFotoModal] = useState(null); 
  const [esExtra, setEsExtra] = useState(false);

  useEffect(() => {
    if (id && user) cargarDetalles();
  }, [id, user]);

  async function cargarDetalles() {
    setLoading(true);
    setErrorMsg("");
    
    try {
      // 1. Obtener cliente_id del usuario logueado para seguridad
      const { data: clienteData } = await supabase
        .from("clientes")
        .select("id")
        .eq("usuario_id", user.id)
        .maybeSingle();

      if (!clienteData) {
        setErrorMsg("Perfil de cliente no encontrado.");
        setLoading(false);
        return;
      }

      const clienteId = clienteData.id;

      // 2. Intentar buscar en INSPECCIONES
      let { data: insp, error: inspErr } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .eq("cliente_id", clienteId) // Seguridad: validar dueño
        .maybeSingle();

      // 3. Si no está en inspecciones, buscar en EXTRAS
      if (!insp) {
        const { data: dataExtra, error: extraErr } = await supabase
          .from("extras")
          .select("*")
          .eq("id", id)
          .eq("cliente_id", clienteId) // Seguridad: validar dueño
          .maybeSingle();

        if (dataExtra) {
          insp = {
            id: dataExtra.id,
            fecha: dataExtra.updated_at || dataExtra.created_at,
            estado: "COMPLETADO", // Estado fijo para extras
            direccion: dataExtra.direccion || "Servicio Extra",
            notas_tecnico: dataExtra.descripcion || "Sin descripción",
            materiales: dataExtra.materiales,
            tiempo_empleado: dataExtra.tiempo_empleado,
            pdf_url: dataExtra.pdf_url
          };
          setEsExtra(true);
          setFotos(dataExtra.fotos || []);
        }
      }

      if (!insp) {
        setErrorMsg("No se encontró el informe solicitado.");
        setLoading(false);
        return;
      }

      setInspeccion(insp);

      // Cargar vivienda si es inspección normal
      if (!esExtra && insp.vivienda_id) {
        const { data: viv } = await supabase
          .from("viviendas")
          .select("direccion, ciudad")
          .eq("id", insp.vivienda_id)
          .maybeSingle();
        setVivienda(viv);
      }

      // Cargar fotos si no es extra
      if (!esExtra) {
        const fotosCargadas = await cargarFotosInspeccion(id);
        setFotos(fotosCargadas || []);
      }

    } catch (err) {
      console.error("Error al cargar:", err);
      setErrorMsg("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  // ... (mantén tus funciones borrarInforme y obtenerUrlPublica igual)
  
  // (El resto del JSX se mantiene igual...)
