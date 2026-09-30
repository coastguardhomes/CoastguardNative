import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext.jsx';

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = {
  color: COLOR_DORADO,
  textShadow: "0 0 12px rgba(224, 176, 52, 0.6)"
};

const traducirConcepto = (texto, idioma) => {
  if (!texto) return texto;
  if (idioma !== 'en' && idioma !== 'english') return texto;

  const diccionario = {
    "Urgencia / Emergencia": "Urgency / Emergency",
    "Apertura de vivienda": "Property opening",
    "Supervisión (por hora o fracción)": "Supervision (per hour or fraction)",
    "Cierre de vivienda": "Property closure",
    "Gestión del técnico": "Technician management",
    "Visita rápida": "Quick visit",
    "Inspección posterior a tormenta": "Post-storm inspection",
    "Coste del técnico": "Technician cost"
  };

  let textoTraducido = texto;

  for (const [esp, eng] of Object.entries(diccionario)) {
    const regex = new RegExp(esp, 'g');
    textoTraducido = textoTraducido.replace(regex, eng);
  }

  return textoTraducido;
};

export default function VerFactura() {
  const { id } = useParams();
  const navigate = useNavigate();

  let currentLang = 'es';

  try {
    const langCtx = useLanguage();
    currentLang = langCtx?.language || langCtx?.idioma || 'es';
  } catch (e) {
    currentLang = 'es';
  }

  const [factura, setFactura] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [inspeccionExtra, setInspeccionExtra] = useState(null);
  const [fotosExtra, setFotosExtra] = useState([]);
  const [procesandoExtra, setProcesandoExtra] = useState(false);

  const parsearFotosExtra = (fotosRaw) => {
    if (!fotosRaw) return [];

    if (Array.isArray(fotosRaw)) {
      return fotosRaw;
    }

    if (typeof fotosRaw === 'string') {
      try {
        const parsed = JSON.parse(fotosRaw);

        if (Array.isArray(parsed)) {
          return parsed;
        }

        return parsed ? [parsed] : [];
      } catch {
        return fotosRaw.trim() ? [fotosRaw] : [];
      }
    }

    if (typeof fotosRaw === 'object') {
      return [fotosRaw];
    }

    return [];
  };

  const obtenerUrlFotoExtra = (foto) => {
    if (!foto) return '';

    const rawUrl =
      typeof foto === 'string'
        ? foto
        : (
            foto.url_foto ||
            foto.url ||
            foto.path ||
            foto.foto_url ||
            ''
          );

    if (!rawUrl) return '';

    if (
      rawUrl.startsWith('http://') ||
      rawUrl.startsWith('https://') ||
      rawUrl.startsWith('data:')
    ) {
      return rawUrl;
    }

    const { data } = supabase.storage
      .from('extras')
      .getPublicUrl(rawUrl);

    return data?.publicUrl || rawUrl;
  };

  const cargarInspeccionExtra = async (facturaData) => {
    try {
      setInspeccionExtra(null);
      setFotosExtra([]);

      const { data: inspeccionData } = await supabase
        .from('inspecciones')
        .select('*')
        .eq('factura_id', facturaData.id)
        .eq('tipo', 'extra')
        .maybeSingle();

      const { data: extraPublicado } = await supabase
        .from('extras')
        .select('*')
        .eq('factura_id', facturaData.id)
        .maybeSingle();

      if (!inspeccionData && !extraPublicado) {
        return;
      }

      let fotos = parsearFotosExtra(
        extraPublicado?.fotos ||
        facturaData.fotos ||
        inspeccionData?.fotos
      );

      if (
        fotos.length === 0 &&
        inspeccionData?.id
      ) {
        const { data: fotosInspeccion } = await supabase
          .from('inspecciones_fotos')
          .select('*')
          .eq('inspeccion_id', inspeccionData.id);

        if (
          fotosInspeccion &&
          fotosInspeccion.length > 0
        ) {
          fotos = fotosInspeccion;
        }
      }

      setFotosExtra(fotos);

      setInspeccionExtra({
        inspeccion: inspeccionData,
        publicado: extraPublicado
      });
    } catch (err) {
      console.error(
        'Error cargando inspección extra:',
        err
      );
    }
  };

  const cargarDatosSeguros = async () => {
    try {
      setErrorMsg('');

      if (!id) {
        throw new Error("ID de factura no proporcionado.");
      }

      const { data: facturaData, error: facturaError } = await supabase
        .from('facturas')
        .select('*')
        .eq('id', id)
        .single();

      if (facturaError) throw facturaError;

      if (!facturaData) {
        throw new Error("No se encontró el aviso de cobro.");
      }

      setFactura(facturaData);

      await cargarInspeccionExtra(facturaData);

      if (facturaData.cliente_id) {
        const { data: clienteData } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', facturaData.cliente_id)
          .single();

        if (clienteData) {
          setCliente(clienteData);
        }
      }
    } catch (err) {
      console.error('Error al cargar la factura:', err);
      setErrorMsg(err.message || 'No se pudo cargar la información.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosSeguros();
  }, [id]);

  useEffect(() => {
    let ultimoChequeo = 0;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const ahora = Date.now();

        if (ahora - ultimoChequeo > 3000) {
          ultimoChequeo = ahora;
          cargarDatosSeguros();
        }
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, [id]);

  const idiomaFinal =
    cliente?.idioma ||
    cliente?.language ||
    currentLang;

  const enviarAvisoPago = async () => {
    try {
      setProcesando(true);

      if (!factura) {
        throw new Error("No se ha cargado la factura.");
      }

      if (!cliente?.email) {
        throw new Error(
          "El cliente no tiene un correo electrónico registrado."
        );
      }

      const importe = Number(factura.total || 0);

      if (!importe || importe <= 0) {
        throw new Error(
          "El importe de la factura no es válido."
        );
      }

      const { data: checkoutData, error: checkoutError } =
        await supabase.functions.invoke(
          "create-checkout-session",
          {
            body: {
              amount: Math.round(importe * 100),
              customerEmail: cliente.email,
              clientId: factura.cliente_id || null,
              facturaId: Number(factura.id),
              originUrl: window.location.origin
            }
          }
        );

      if (checkoutError) {
        let errorMsg = checkoutError.message;

        try {
          const body = await checkoutError.context?.json();

          if (body?.error) {
            errorMsg = body.error;
          }
        } catch (e) {}

        throw new Error(errorMsg);
      }

      if (!checkoutData?.url) {
        throw new Error(
          "Stripe no ha devuelto una URL de pago."
        );
      }

      const { error: errEmail } =
        await supabase.functions.invoke(
          'enviar-email',
          {
            body: {
              factura_id: Number(factura.id),
              facturaId: Number(factura.id),
              id: Number(factura.id),
              tipo: 'aviso_pago',
              customerEmail: cliente.email,
              customerName: cliente.nombre,
              stripeUrl: checkoutData.url,
              title:
                `Aviso de pago ${factura.numero || `#${factura.id}`}`
            }
          }
        );

      if (errEmail) {
        throw errEmail;
      }

      alert(
        '¡Aviso de pago enviado por email al cliente correctamente!'
      );
    } catch (err) {
      console.error(
        "Error enviando aviso de pago:",
        err
      );

      alert(
        'Error al enviar el aviso: ' +
        (err.message || '')
      );
    } finally {
      setProcesando(false);
    }
  };

  const marcarComoPagada = async () => {
    try {
      setProcesando(true);

      if (!factura) {
        throw new Error("No se ha cargado la factura.");
      }

      const { data, error } =
        await supabase.functions.invoke(
          "factura-pdf",
          {
            body: {
              facturaId: Number(factura.id),
              pagoConfirmado: true
            }
          }
        );

      if (error) {
        let mensaje = error.message;

        try {
          const body = await error.context?.json();

          if (body?.error) {
            mensaje = body.error;
          }
        } catch (e) {}

        throw new Error(mensaje);
      }

      if (!data?.ok) {
        throw new Error(
          data?.error ||
          "No se pudo confirmar el pago."
        );
      }

      await cargarDatosSeguros();

      alert(
        data?.facturadirecta?.numero
          ? `Pago confirmado. Factura oficial ${data.facturadirecta.numero} creada y enviada.`
          : "Pago confirmado y factura oficial procesada correctamente."
      );
    } catch (err) {
      console.error(
        "Error confirmando pago:",
        err
      );

      alert(
        'Error al confirmar el pago: ' +
        (err.message || '')
      );
    } finally {
      setProcesando(false);
    }
  };

  const enviarInspeccionExtraAlCliente = async () => {
    try {
      setProcesandoExtra(true);

      if (!factura) {
        throw new Error('No se ha cargado la factura.');
      }

      if (!factura.cliente_id) {
        throw new Error('No se ha encontrado el cliente de la factura.');
      }

      if (!inspeccionExtra?.inspeccion && !inspeccionExtra?.publicado) {
        throw new Error('No se ha encontrado la inspección extra.');
      }

      const inspeccion = inspeccionExtra?.inspeccion;
      const extraExistente = inspeccionExtra?.publicado;

      const fotos = fotosExtra
        .map((foto) => {
          if (typeof foto === 'string') return foto;

          return (
            foto.url_foto ||
            foto.url ||
            foto.path ||
            foto.foto_url ||
            ''
          );
        })
        .filter(Boolean);

      const payload = {
        inspeccion_id:
          inspeccion?.id ||
          extraExistente?.inspeccion_id ||
          null,
        contrato_id:
          factura.contrato_id ||
          extraExistente?.contrato_id ||
          null,
        descripcion:
          inspeccion?.descripcion ||
          factura.descripcion ||
          'Inspección extra',
        precio: Number(
          extraExistente?.precio ||
          factura.total ||
          0
        ),
        estado: 'completado',
        creado_en:
          extraExistente?.creado_en ||
          inspeccion?.fecha ||
          new Date().toISOString(),
        materiales:
          inspeccion?.materiales ||
          factura.materiales ||
          null,
        tiempo_empleado:
          inspeccion?.tiempo_empleado ||
          factura.tiempo_empleado ||
          null,
        fotos,
        cliente_id: factura.cliente_id,
        direccion:
          extraExistente?.direccion ||
          null,
        factura_id: Number(factura.id),
        vivienda_id:
          factura.vivienda_id ||
          extraExistente?.vivienda_id ||
          null,
        tecnico_id:
          inspeccion?.tecnico_id ||
          extraExistente?.tecnico_id ||
          null,
        estado_tecnico: 'completado',
        visto: false,
        alerta:
          factura.alerta ||
          extraExistente?.alerta ||
          false,
        alerta_vista: false,
        pdf_url:
          extraExistente?.pdf_url ||
          null,
        cliente_email:
          cliente?.email ||
          extraExistente?.cliente_email ||
          null
      };

      let resultado;

      if (extraExistente?.id) {
        resultado = await supabase
          .from('extras')
          .update(payload)
          .eq('id', extraExistente.id)
          .select()
          .single();
      } else {
        resultado = await supabase
          .from('extras')
          .insert(payload)
          .select()
          .single();
      }

      if (resultado.error) {
        throw resultado.error;
      }

      setInspeccionExtra((actual) => ({
        ...(actual || {}),
        publicado: resultado.data
      }));

      alert(
        'Inspección extra revisada y enviada al área de inspecciones del cliente correctamente.'
      );
    } catch (err) {
      console.error(
        'Error enviando inspección extra al cliente:',
        err
      );

      alert(
        'Error al enviar la inspección extra: ' +
        (err.message || '')
      );
    } finally {
      setProcesandoExtra(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar este aviso de cobro?"
      )
    ) {
      return;
    }

    try {
      setProcesando(true);

      const { error } = await supabase
        .from('facturas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert(
        "Aviso de cobro eliminado correctamente."
      );

      navigate(-1);
    } catch (err) {
      alert(
        "Error: " +
        err.message
      );
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: FONDO_PRINCIPAL,
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <h3 style={TEXTO_DORADO_BRILLO}>
          Cargando detalle...
        </h3>
      </div>
    );
  }

  if (errorMsg || !factura) {
    return (
      <div
        style={{
          backgroundColor: FONDO_PRINCIPAL,
          minHeight: '100vh',
          padding: '20px',
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center'
        }}
      >
        <h2
          style={{
            color: '#ef4444',
            marginTop: '40px'
          }}
        >
          ⚠️ Error
        </h2>

        <p
          style={{
            color: '#cbd5e1',
            fontSize: '14px'
          }}
        >
          {errorMsg ||
            'El registro no existe o no está accesible.'}
        </p>

        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: '20px',
            padding: '12px 20px',
            background: COLOR_DORADO,
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#000'
          }}
        >
          Volver Atrás
        </button>
      </div>
    );
  }

  const esPagada =
    factura.estado_pago?.toLowerCase() === 'pagada' ||
    factura.estado?.toLowerCase() === 'pagada' ||
    factura.estado?.toLowerCase() === 'finalizado';

  const colorEstado =
    esPagada
      ? '#34d399'
      : COLOR_DORADO;

  const textoEstado =
    esPagada
      ? 'PAGADA'
      : 'PENDIENTE';

  const itemsDetalle =
    Array.isArray(factura.items)
      ? factura.items
      : [];

  const descripcionTraducida =
    traducirConcepto(
      factura.descripcion,
      idiomaFinal
    );

  return (
    <div style={estilos.pagina}>
      <div style={estilos.contenedor}>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={estilos.botonVolver}
          >
            ← Volver
          </button>

          <span
            style={{
              fontSize: '11px',
              color: '#64748b',
              textTransform: 'uppercase',
              fontWeight: 'bold'
            }}
          >
            Panel de Administración
          </span>
        </div>

        <div style={estilos.cabecera}>
          <h2 style={estilos.titulo}>
            {esPagada ? 'FACTURA' : 'AVISO DE COBRO'}{' '}
            {factura.numero || `#${factura.id}`}
          </h2>
        </div>

        <div style={estilos.tarjeta}>
          <h3
            style={{
              ...TEXTO_DORADO_BRILLO,
              fontSize: '12px',
              margin: '0 0 8px 0',
              textTransform: 'uppercase'
            }}
          >
            Datos del Cliente
          </h3>

          <p
            style={{
              fontSize: '13px',
              color: '#fff',
              margin: '4px 0'
            }}
          >
            <strong>Nombre:</strong>{' '}
            {cliente?.nombre || 'N/A'}
          </p>

          <p
            style={{
              fontSize: '13px',
              color: '#fff',
              margin: '4px 0'
            }}
          >
            <strong>Email:</strong>{' '}
            {cliente?.email || 'N/A'}
          </p>

          <p
            style={{
              fontSize: '13px',
              color: '#fff',
              margin: '4px 0'
            }}
          >
            <strong>Teléfono:</strong>{' '}
            {cliente?.telefono || 'N/A'}
          </p>
        </div>

        <div style={estilos.tarjeta}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}
          >
            <span style={estilos.etiqueta}>
              Fecha:
            </span>

            <span style={estilos.valor}>
              {factura.created_at
                ? factura.created_at.split('T')[0]
                : 'N/D'}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}
          >
            <span style={estilos.etiqueta}>
              Estado:
            </span>

            <span
              style={{
                ...estilos.valorEstado,
                color: colorEstado,
                borderColor: colorEstado
              }}
            >
              {textoEstado}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}
          >
            <span style={estilos.etiqueta}>
              Importe Total:
            </span>

            <span
              style={{
                fontSize: '16px',
                color: COLOR_DORADO,
                fontWeight: '900'
              }}
            >
              {Number(
                factura.total || 0
              ).toFixed(2)} €
            </span>
          </div>

          <div
            style={{
              marginTop: '10px',
              background: 'rgba(11, 19, 32, 0.7)',
              padding: '12px',
              borderRadius: '10px',
              border: BORDE_DORADO_FINO
            }}
          >
            <p
              style={{
                fontSize: '12px',
                color: '#94a3b8',
                margin: '0 0 4px 0',
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}
            >
              Descripción:
            </p>

            <p
              style={{
                fontSize: '13px',
                color: '#fff',
                margin: 0,
                whiteSpace: 'pre-wrap',
                lineHeight: '1.4'
              }}
            >
              {descripcionTraducida ||
                'Sin descripción'}
            </p>
          </div>

          {!esPagada && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '15px'
              }}
            >
              <button
                onClick={enviarAvisoPago}
                disabled={procesando}
                style={estilos.botonAzul}
              >
                ✉️ Enviar Aviso de Pago (Stripe)
              </button>

              <button
                onClick={marcarComoPagada}
                disabled={procesando}
                style={estilos.botonVerde}
              >
                💳 Confirmar pago y emitir factura
              </button>
            </div>
          )}
        </div>

        {inspeccionExtra && (
          <div style={estilos.tarjeta}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}
            >
              <h3
                style={{
                  ...TEXTO_DORADO_BRILLO,
                  fontSize: '12px',
                  margin: 0,
                  textTransform: 'uppercase'
                }}
              >
                Inspección Extra
              </h3>

              <span
                style={{
                  fontSize: '10px',
                  color:
                    inspeccionExtra.publicado
                      ? '#34d399'
                      : '#f59e0b',
                  fontWeight: '900',
                  textTransform: 'uppercase'
                }}
              >
                {inspeccionExtra.publicado
                  ? 'ENVIADA AL CLIENTE'
                  : 'PENDIENTE DE REVISIÓN'}
              </span>
            </div>

            <p
              style={{
                fontSize: '13px',
                color: '#fff',
                margin: '4px 0'
              }}
            >
              <strong>Descripción:</strong>{' '}
              {inspeccionExtra.inspeccion?.descripcion ||
                factura.descripcion ||
                'Sin descripción'}
            </p>

            {(inspeccionExtra.inspeccion?.materiales ||
              factura.materiales) && (
              <p
                style={{
                  fontSize: '13px',
                  color: '#cbd5e1',
                  margin: '4px 0'
                }}
              >
                <strong>Materiales:</strong>{' '}
                {inspeccionExtra.inspeccion?.materiales ||
                  factura.materiales}
              </p>
            )}

            {(inspeccionExtra.inspeccion?.tiempo_empleado ||
              factura.tiempo_empleado) && (
              <p
                style={{
                  fontSize: '13px',
                  color: '#cbd5e1',
                  margin: '4px 0'
                }}
              >
                <strong>Tiempo empleado:</strong>{' '}
                {inspeccionExtra.inspeccion?.tiempo_empleado ||
                  factura.tiempo_empleado}
              </p>
            )}

            {fotosExtra.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(3, minmax(0, 1fr))',
                  gap: '8px',
                  marginTop: '12px'
                }}
              >
                {fotosExtra.map((foto, index) => {
                  const url =
                    obtenerUrlFotoExtra(foto);

                  if (!url) return null;

                  return (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={url}
                        alt={'Foto de inspección extra ' + (index + 1)}
                        style={{
                          width: '100%',
                          height: '90px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                          border: BORDE_DORADO_FINO
                        }}
                      />
                    </a>
                  );
                })}
              </div>
            ) : (
              <p
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginTop: '10px'
                }}
              >
                No hay fotografías asociadas a esta inspección.
              </p>
            )}

            {!inspeccionExtra.publicado && (
              <button
                onClick={enviarInspeccionExtraAlCliente}
                disabled={procesandoExtra}
                style={{
                  ...estilos.botonVerde,
                  marginTop: '14px'
                }}
              >
                {procesandoExtra
                  ? 'Enviando...'
                  : '📤 Revisar y enviar al cliente'}
              </button>
            )}
          </div>
        )}

        {itemsDetalle.length > 0 && (
          <div style={estilos.tarjeta}>
            <h3
              style={{
                ...TEXTO_DORADO_BRILLO,
                fontSize: '12px',
                margin: '0 0 10px 0',
                textTransform: 'uppercase'
              }}
            >
              Desglose de Conceptos
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {itemsDetalle.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom:
                      '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#e2e8f0',
                      maxWidth: '70%'
                    }}
                  >
                    {traducirConcepto(
                      item.concepto ||
                      item.descripcion,
                      idiomaFinal
                    )}
                  </span>

                  <span
                    style={{
                      fontSize: '12px',
                      color: COLOR_DORADO,
                      fontWeight: 'bold'
                    }}
                  >
                    {Number(
                      item.precio ||
                      item.total ||
                      0
                    ).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleDelete}
          disabled={procesando}
          style={estilos.botonEliminar}
        >
          {procesando
            ? 'Procesando...'
            : '🗑️ Eliminar Aviso de Cobro'}
        </button>

      </div>
    </div>
  );
}

const estilos = {
  pagina: {
    backgroundColor: FONDO_PRINCIPAL,
    minHeight: '100vh',
    padding: '16px',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box'
  },

  contenedor: {
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxSizing: 'border-box'
  },

  botonVolver: {
    background: 'transparent',
    border: BORDE_DORADO_FINO,
    color: COLOR_DORADO,
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  },

  cabecera: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: BORDE_DORADO_FINO,
    paddingBottom: '12px'
  },

  titulo: {
    ...TEXTO_DORADO_BRILLO,
    fontSize: '16px',
    fontWeight: '900',
    margin: 0,
    textTransform: 'uppercase',
    textAlign: 'center'
  },

  tarjeta: {
    background: FONDO_TARJETA,
    border: BORDE_DORADO_FINO,
    borderRadius: '16px',
    padding: '16px',
    boxShadow: SOMBRA_LUXURY,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box'
  },

  etiqueta: {
    fontSize: '12px',
    color: COLOR_DORADO,
    fontWeight: '700',
    textTransform: 'uppercase'
  },

  valor: {
    fontSize: '13px',
    color: '#fff',
    fontWeight: '600',
    textAlign: 'right'
  },

  valorEstado: {
    fontSize: '11px',
    fontWeight: '900',
    textTransform: 'uppercase',
    border: '1px solid',
    borderRadius: '20px',
    padding: '2px 10px'
  },

  botonAzul: {
    width: '100%',
    padding: '12px',
    background:
      'linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)',
    color: '#fff',
    border:
      '1px solid rgba(56, 189, 248, 0.5)',
    borderRadius: '12px',
    fontWeight: '900',
    fontSize: '12px',
    cursor: 'pointer',
    textTransform: 'uppercase'
  },

  botonVerde: {
    width: '100%',
    padding: '12px',
    background:
      'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    color: '#fff',
    border:
      '1px solid rgba(16, 185, 129, 0.6)',
    borderRadius: '12px',
    fontWeight: '900',
    fontSize: '12px',
    cursor: 'pointer',
    textTransform: 'uppercase'
  },

  botonEliminar: {
    width: '100%',
    padding: '14px',
    background:
      'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
    color: '#fff',
    border:
      '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: '14px',
    fontWeight: '900',
    fontSize: '12px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    boxShadow:
      '0 4px 15px rgba(239, 68, 68, 0.3)',
    marginTop: '10px'
  }
};
