
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { resolverUrlPdfSegura } from '../../lib/urlPdf.js';

const COLOR_DORADO = '#e0b034';
const FONDO_PRINCIPAL = '#030509';
const FONDO_TARJETA =
  'linear-gradient(145deg, #0b1320 0%, #04070d 100%)';
const BORDE_DORADO_FINO =
  '1px solid rgba(224, 176, 52, 0.4)';
const SOMBRA_LUXURY =
  '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)';

const TEXTO_DORADO_BRILLO = {
  color: COLOR_DORADO,
  textShadow: '0 0 12px rgba(224, 176, 52, 0.6)'
};

const traducirConcepto = (texto, idioma) => {
  if (!texto) return texto;
  if (idioma !== 'en' && idioma !== 'english') return texto;

  const diccionario = {
    'Urgencia / Emergencia': 'Urgency / Emergency',
    'Apertura de vivienda': 'Property opening',
    'Supervisión (por hora o fracción)': 'Supervision (per hour or fraction)',
    'Cierre de vivienda': 'Property closure',
    'Gestión del técnico': 'Technician management',
    'Visita rápida': 'Quick visit',
    'Inspección posterior a tormenta': 'Post-storm inspection',
    'Coste del técnico': 'Technician cost'
  };

  let textoTraducido = texto;

  for (const [esp, eng] of Object.entries(diccionario)) {
    textoTraducido = textoTraducido.replace(
      new RegExp(esp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      eng
    );
  }

  return textoTraducido;
};

export default function VerFactura() {
  const { id } = useParams();
  const navigate = useNavigate();

  const langCtx = useLanguage();
  const currentLang =
    langCtx?.language ||
    langCtx?.idioma ||
    'es';

  const [factura, setFactura] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [inspeccionExtra, setInspeccionExtra] = useState(null);
  const [fotosExtra, setFotosExtra] = useState([]);
  const [fotosUrlsFirmadas, setFotosUrlsFirmadas] = useState({});
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
        return fotosRaw.trim() ? [fotosRaw.trim()] : [];
      }
    }

    if (typeof fotosRaw === 'object') {
      return [fotosRaw];
    }

    return [];
  };

  /*
   * Las fotografías del extra pertenecen al bucket privado
   * "extras", salvo que la referencia indique expresamente
   * otro bucket.
   *
   * Las rutas actuales tienen el formato:
   * fotos/nombre-del-archivo.jpg
   *
   * En ese caso, "fotos" es una carpeta dentro de "extras",
   * NO un bucket independiente.
   */
  const obtenerReferenciaFoto = (foto) => {
    if (!foto) return null;

    const referencia =
      typeof foto === 'string'
        ? foto.trim()
        : (
            foto.url_foto ||
            foto.url ||
            foto.path ||
            foto.foto_url ||
            foto.url_storage_o_path ||
            foto.archivo ||
            foto.ruta ||
            foto.name ||
            ''
          );

    if (typeof referencia !== 'string' || !referencia.trim()) {
      return null;
    }

    let valor = referencia.trim();

    let bucket =
      typeof foto === 'object'
        ? (
            foto.bucket ||
            foto.bucket_id ||
            foto.bucketId ||
            'extras'
          )
        : 'extras';

    if (/^https?:\/\//i.test(valor)) {
      return { valor, bucket };
    }

    valor = valor.replace(/^\/+/, '');

    /*
     * Solo quitamos el prefijo cuando coincide con el nombre
     * de un bucket real incluido explícitamente en la ruta.
     *
     * No incluir "fotos": es una carpeta de "extras".
     */
    const prefijosBucket = ['extras', 'facturas'];

    for (const prefijo of prefijosBucket) {
      if (valor.startsWith(`${prefijo}/`)) {
        bucket = prefijo;
        valor = valor.slice(prefijo.length + 1);
        break;
      }
    }

    if (!valor) return null;

    return { valor, bucket };
  };

  useEffect(() => {
    let cancelado = false;

    const cargarUrlsFirmadas = async () => {
      if (!fotosExtra || fotosExtra.length === 0) {
        setFotosUrlsFirmadas({});
        return;
      }

      setFotosUrlsFirmadas({});
      const nuevasUrls = {};

      for (let i = 0; i < fotosExtra.length; i++) {
        if (cancelado) return;

        const referenciaFoto = obtenerReferenciaFoto(fotosExtra[i]);

        if (!referenciaFoto) continue;

        const { valor, bucket } = referenciaFoto;

        if (
          valor.startsWith('data:') ||
          valor.startsWith('blob:')
        ) {
          nuevasUrls[i] = valor;
          continue;
        }

        try {
          const urlResuelta = await resolverUrlPdfSegura(
            valor,
            bucket,
            3600
          );

          if (cancelado) return;

          if (urlResuelta) {
            nuevasUrls[i] = urlResuelta;
          } else {
            console.error(
              `No se pudo resolver la fotografía ${i + 1} del bucket "${bucket}".`
            );
          }
        } catch (error) {
          console.error(
            `Error resolviendo la fotografía ${i + 1}:`,
            error
          );
        }
      }

      if (!cancelado) {
        setFotosUrlsFirmadas(nuevasUrls);
      }
    };

    cargarUrlsFirmadas();

    return () => {
      cancelado = true;
    };
  }, [fotosExtra]);

  const cargarInspeccionExtra = async (facturaData) => {
    try {
      setInspeccionExtra(null);
      setFotosExtra([]);
      setFotosUrlsFirmadas({});

      const {
        data: extraPublicado,
        error: extraError
      } = await supabase
        .from('extras')
        .select('*')
        .eq('factura_id', facturaData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (extraError) {
        throw extraError;
      }

      if (!extraPublicado) {
        return;
      }

      let inspeccionData = null;

      /*
       * La inspección relacionada se consulta únicamente
       * para mostrar información descriptiva del trabajo.
       * Sus fotografías NO se utilizan para el extra.
       */
      if (extraPublicado.inspeccion_id) {
        const {
          data: inspeccionRelacionada,
          error: inspeccionError
        } = await supabase
          .from('inspecciones')
          .select('*')
          .eq('id', extraPublicado.inspeccion_id)
          .maybeSingle();

        if (inspeccionError) {
          console.error(
            'Error cargando inspección relacionada:',
            inspeccionError
          );
        } else {
          inspeccionData = inspeccionRelacionada;
        }
      }

      /*
       * Las fotos se obtienen exclusivamente de extras.fotos.
       * No recurrir a inspecciones.fotos ni a fotos_inspeccion,
       * porque pertenecen a las inspecciones normales.
       */
      const fotos = parsearFotosExtra(extraPublicado.fotos);

      setFotosExtra(fotos);

      setInspeccionExtra({
        inspeccion: inspeccionData,
        publicado: extraPublicado
      });
    } catch (err) {
      console.error('Error cargando inspección extra:', err);
    }
  };

  const cargarDatosSeguros = async () => {
    try {
      setErrorMsg('');

      if (!id) {
        throw new Error('ID de factura no proporcionado.');
      }

      const {
        data: facturaData,
        error: facturaError
      } = await supabase
        .from('facturas')
        .select('*')
        .eq('id', id)
        .single();

      if (facturaError) {
        throw facturaError;
      }

      if (!facturaData) {
        throw new Error('No se encontró el aviso de cobro.');
      }

      setFactura(facturaData);

      await cargarInspeccionExtra(facturaData);

      if (facturaData.cliente_id) {
        const {
          data: clienteData,
          error: clienteError
        } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', facturaData.cliente_id)
          .single();

        if (clienteError) {
          console.error('Error cargando cliente:', clienteError);
        }

        setCliente(clienteData || null);
      } else {
        setCliente(null);
      }
    } catch (err) {
      console.error('Error al cargar la factura:', err);

      setErrorMsg(
        err.message || 'No se pudo cargar la información.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      if (!cancelado) {
        await cargarDatosSeguros();
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, [id]);

  useEffect(() => {
    let ultimoChequeo = 0;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;

      const ahora = Date.now();

      if (ahora - ultimoChequeo > 3000) {
        ultimoChequeo = ahora;
        cargarDatosSeguros();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

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
        throw new Error('No se ha cargado la factura.');
      }

      if (!cliente?.email) {
        throw new Error(
          'El cliente no tiene un correo electrónico registrado.'
        );
      }

      const importe = Number(factura.total || 0);

      if (!importe || importe <= 0) {
        throw new Error('El importe de la factura no es válido.');
      }

      const {
        data: checkoutData,
        error: checkoutError
      } = await supabase.functions.invoke(
        'create-checkout-session',
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
        let mensaje = checkoutError.message;

        try {
          const body = await checkoutError.context?.json();

          if (body?.error) {
            mensaje = body.error;
          }
        } catch {}

        throw new Error(mensaje);
      }

      if (!checkoutData?.url) {
        throw new Error('Stripe no ha devuelto una URL de pago.');
      }

      const { error: errEmail } =
        await supabase.functions.invoke('enviar-email', {
          body: {
            factura_id: Number(factura.id),
            facturaId: Number(factura.id),
            id: Number(factura.id),
            tipo: 'aviso_pago',
            customerEmail: cliente.email,
            customerName: cliente.nombre,
            stripeUrl: checkoutData.url,
            title: `Aviso de pago ${
              factura.numero || `#${factura.id}`
            }`
          }
        });

      if (errEmail) {
        throw errEmail;
      }

      alert(
        '¡Aviso de pago enviado por email al cliente correctamente!'
      );
    } catch (err) {
      console.error('Error enviando aviso de pago:', err);

      alert(
        'Error al enviar el aviso: ' + (err.message || '')
      );
    } finally {
      setProcesando(false);
    }
  };

  const marcarComoPagada = async () => {
    try {
      setProcesando(true);

      if (!factura) {
        throw new Error('No se ha cargado la factura.');
      }

      const { data, error } =
        await supabase.functions.invoke('factura-pdf', {
          body: {
            facturaId: Number(factura.id),
            pagoConfirmado: true
          }
        });

      if (error) {
        let mensaje = error.message;

        try {
          const body = await error.context?.json();

          if (body?.error) {
            mensaje = body.error;
          }
        } catch {}

        throw new Error(mensaje);
      }

      if (!data?.ok) {
        throw new Error(
          data?.error || 'No se pudo confirmar el pago.'
        );
      }

      await cargarDatosSeguros();

      alert(
        data?.facturadirecta?.numero
          ? `Pago confirmado. Factura oficial ${data.facturadirecta.numero} creada y procesada.`
          : 'Pago confirmado y factura oficial procesada correctamente.'
      );
    } catch (err) {
      console.error('Error confirmando pago:', err);

      alert(
        'Error al confirmar el pago: ' + (err.message || '')
      );
    } finally {
      setProcesando(false);
    }
  };

  /*
   * Administración aprueba y publica la inspección extra
   * cuando el técnico la ha completado y la factura está pagada.
   */
  const aprobarYEnviarAlCliente = async () => {
    try {
      setProcesandoExtra(true);

      if (!factura) {
        throw new Error('No se ha cargado la factura.');
      }

      if (!inspeccionExtra?.publicado?.id) {
        throw new Error('No se ha encontrado la inspección extra.');
      }

      const estadoPago = String(
        factura.estado_pago || ''
      ).toLowerCase();

      const estadoFactura = String(
        factura.estado || ''
      ).toLowerCase();

      const facturaPagada =
        estadoPago === 'pagada' ||
        estadoFactura === 'pagada' ||
        estadoFactura === 'finalizado';

      if (!facturaPagada) {
        throw new Error(
          'La factura todavía no está pagada. No se puede publicar al cliente.'
        );
      }

      const extraExistente = inspeccionExtra.publicado;

      const estadosTecnicoCompletado = [
        'completado',
        'completada',
        'finalizado',
        'finalizada'
      ];

      const estadoTecnico = String(
        extraExistente.estado_tecnico || ''
      ).toLowerCase();

      if (!estadosTecnicoCompletado.includes(estadoTecnico)) {
        throw new Error(
          'La inspección extra todavía no ha sido completada por el técnico.'
        );
      }

      if (
        String(extraExistente.estado || '').toLowerCase() ===
        'enviado_cliente'
      ) {
        alert(
          'Esta inspección extra ya está publicada para el cliente.'
        );

        await cargarDatosSeguros();
        return;
      }

      const { error: aprobarError } = await supabase
        .from('extras')
        .update({ estado_admin: 'aprobada' })
        .eq('id', extraExistente.id);

      if (aprobarError) {
        throw new Error(
          'No se pudo aprobar la inspección extra: ' +
          aprobarError.message
        );
      }

      const {
        data: envioExtra,
        error: errorExtra
      } = await supabase.functions.invoke(
        'enviar-extra-cliente',
        {
          body: {
            extraId: extraExistente.id
          }
        }
      );

      if (errorExtra) {
        let mensaje = errorExtra.message;

        try {
          const body = await errorExtra.context?.json();

          if (body?.error) {
            mensaje = body.error;
          }
        } catch {}

        throw new Error(mensaje);
      }

      if (!envioExtra?.ok) {
        throw new Error(
          envioExtra?.error ||
          'No se pudo publicar la inspección extra para el cliente.'
        );
      }

      await cargarDatosSeguros();

      alert(
        'Inspección extra publicada correctamente en el portal del cliente.'
      );
    } catch (err) {
      console.error('Error publicando inspección extra:', err);

      await cargarDatosSeguros();

      alert(
        'No se ha podido publicar para el cliente: ' +
        (err.message || 'Error desconocido.')
      );
    } finally {
      setProcesandoExtra(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        '¿Estás seguro de que deseas eliminar este aviso de cobro?'
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

      if (error) {
        throw error;
      }

      alert('Aviso de cobro eliminado correctamente.');
      navigate(-1);
    } catch (err) {
      alert('Error: ' + err.message);
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

  const colorEstado = esPagada ? '#34d399' : COLOR_DORADO;
  const textoEstado = esPagada ? 'PAGADA' : 'PENDIENTE';

  const itemsDetalle = Array.isArray(factura.items)
    ? factura.items
    : [];

  const descripcionTraducida = traducirConcepto(
    factura.descripcion,
    idiomaFinal
  );

  const extraActual = inspeccionExtra?.publicado || null;

  const estadoExtra = String(
    extraActual?.estado || ''
  ).toLowerCase();

  const estadoAdminExtra = String(
    extraActual?.estado_admin || ''
  ).toLowerCase();

  const estadoTecnicoExtra = String(
    extraActual?.estado_tecnico || ''
  ).toLowerCase();

  const tecnicoHaCompletadoExtra = [
    'completado',
    'completada',
    'finalizado',
    'finalizada'
  ].includes(estadoTecnicoExtra);

  const extraYaEnviado = estadoExtra === 'enviado_cliente';
  const extraAprobado = estadoAdminExtra === 'aprobada';

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

          <p style={estilos.textoBlanco}>
            <strong>Nombre:</strong> {cliente?.nombre || 'N/A'}
          </p>

          <p style={estilos.textoBlanco}>
            <strong>Email:</strong> {cliente?.email || 'N/A'}
          </p>

          <p style={estilos.textoBlanco}>
            <strong>Teléfono:</strong> {cliente?.telefono || 'N/A'}
          </p>
        </div>

        <div style={estilos.tarjeta}>
          <div style={estilos.fila}>
            <span style={estilos.etiqueta}>Fecha:</span>
            <span style={estilos.valor}>
              {factura.created_at
                ? factura.created_at.split('T')[0]
                : 'N/D'}
            </span>
          </div>

          <div style={estilos.fila}>
            <span style={estilos.etiqueta}>Estado:</span>
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

          <div style={estilos.fila}>
            <span style={estilos.etiqueta}>Importe Total:</span>
            <span
              style={{
                fontSize: '16px',
                color: COLOR_DORADO,
                fontWeight: '900'
              }}
            >
              {Number(factura.total || 0).toFixed(2)} €
            </span>
          </div>

          <div style={estilos.descripcionCaja}>
            <p style={estilos.descripcionTitulo}>Descripción:</p>
            <p style={estilos.descripcionTexto}>
              {descripcionTraducida || 'Sin descripción'}
            </p>
          </div>

          {!esPagada && (
            <div style={estilos.botonesPago}>
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
            <div style={estilos.cabeceraExtra}>
              <h3 style={estilos.tituloExtra}>
                Inspección Extra
              </h3>

              <span
                style={{
                  fontSize: '10px',
                  color: extraYaEnviado
                    ? '#34d399'
                    : extraAprobado
                      ? '#f59e0b'
                      : tecnicoHaCompletadoExtra
                        ? '#f59e0b'
                        : '#94a3b8',
                  fontWeight: '900',
                  textTransform: 'uppercase'
                }}
              >
                {extraYaEnviado
                  ? 'PUBLICADA AL CLIENTE'
                  : extraAprobado
                    ? 'APROBADA'
                    : tecnicoHaCompletadoExtra
                      ? 'PENDIENTE DE APROBACIÓN'
                      : 'PENDIENTE DEL TÉCNICO'}
              </span>
            </div>

            <p style={estilos.textoBlanco}>
              <strong>Descripción:</strong>{' '}
              {extraActual?.descripcion ||
                inspeccionExtra.inspeccion?.descripcion ||
                'Sin descripción'}
            </p>

            {(extraActual?.materiales ||
              inspeccionExtra.inspeccion?.materiales_usados) && (
              <p style={estilos.textoSecundario}>
                <strong>Materiales:</strong>{' '}
                {extraActual?.materiales ||
                  inspeccionExtra.inspeccion?.materiales_usados}
              </p>
            )}

            {(extraActual?.tiempo_empleado ||
              inspeccionExtra.inspeccion?.tiempo_empleado) && (
              <p style={estilos.textoSecundario}>
                <strong>Tiempo empleado:</strong>{' '}
                {extraActual?.tiempo_empleado ||
                  inspeccionExtra.inspeccion?.tiempo_empleado}
              </p>
            )}

            {fotosExtra.length > 0 ? (
              <div style={estilos.rejillaFotos}>
                {fotosExtra.map((foto, index) => {
                  const url = fotosUrlsFirmadas[index];

                  if (!url) {
                    return (
                      <div
                        key={index}
                        style={estilos.fotoPendiente}
                        aria-label={`Fotografía ${index + 1} no disponible`}
                      >
                        Foto no disponible
                      </div>
                    );
                  }

                  return (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={url}
                        alt={`Foto de inspección extra ${index + 1}`}
                        style={estilos.foto}
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    </a>
                  );
                })}
              </div>
            ) : (
              <p style={estilos.textoSinFotos}>
                No hay fotografías asociadas a esta inspección.
              </p>
            )}

            {extraYaEnviado && (
              <div style={estilos.avisoPublicado}>
                <p style={estilos.textoPublicado}>
                  ✓ Esta inspección extra ya está publicada en el portal del cliente.
                </p>
              </div>
            )}

            {!extraYaEnviado && tecnicoHaCompletadoExtra && (
              <button
                onClick={aprobarYEnviarAlCliente}
                disabled={
                  procesandoExtra ||
                  !esPagada
                }
                style={{
                  ...estilos.botonVerde,
                  marginTop: '14px',
                  opacity:
                    procesandoExtra || !esPagada
                      ? 0.65
                      : 1,
                  cursor:
                    procesandoExtra || !esPagada
                      ? 'not-allowed'
                      : 'pointer'
                }}
              >
                {procesandoExtra
                  ? 'Publicando...'
                  : '📤 PUBLICAR AL CLIENTE'}
              </button>
            )}

            {!extraYaEnviado && !tecnicoHaCompletadoExtra && (
              <div style={estilos.avisoPendiente}>
                <p style={estilos.textoPendiente}>
                  La inspección todavía no ha sido completada por el técnico.
                </p>
              </div>
            )}
          </div>
        )}

        {itemsDetalle.length > 0 && (
          <div style={estilos.tarjeta}>
            <h3 style={estilos.tituloDesglose}>
              Desglose de Conceptos
            </h3>

            <div style={estilos.listaConceptos}>
              {itemsDetalle.map((item, index) => (
                <div key={index} style={estilos.filaConcepto}>
                  <span style={estilos.concepto}>
                    {traducirConcepto(
                      item.concepto || item.descripcion,
                      idiomaFinal
                    )}
                  </span>

                  <span style={estilos.precioConcepto}>
                    {Number(
                      item.precio || item.total || 0
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

  textoBlanco: {
    fontSize: '13px',
    color: '#fff',
    margin: '4px 0'
  },

  textoSecundario: {
    fontSize: '13px',
    color: '#cbd5e1',
    margin: '4px 0'
  },

  fila: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
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

  descripcionCaja: {
    marginTop: '10px',
    background: 'rgba(11, 19, 32, 0.7)',
    padding: '12px',
    borderRadius: '10px',
    border: BORDE_DORADO_FINO
  },

  descripcionTitulo: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: '0 0 4px 0',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },

  descripcionTexto: {
    fontSize: '13px',
    color: '#fff',
    margin: 0,
    whiteSpace: 'pre-wrap',
    lineHeight: '1.4'
  },

  botonesPago: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '15px'
  },

  botonAzul: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)',
    color: '#fff',
    border: '1px solid rgba(56, 189, 248, 0.5)',
    borderRadius: '12px',
    fontWeight: '900',
    fontSize: '12px',
    cursor: 'pointer',
    textTransform: 'uppercase'
  },

  botonVerde: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    color: '#fff',
    border: '1px solid rgba(16, 185, 129, 0.6)',
    borderRadius: '12px',
    fontWeight: '900',
    fontSize: '12px',
    cursor: 'pointer',
    textTransform: 'uppercase'
  },

  cabeceraExtra: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    gap: '8px'
  },

  tituloExtra: {
    ...TEXTO_DORADO_BRILLO,
    fontSize: '12px',
    margin: 0,
    textTransform: 'uppercase'
  },

  rejillaFotos: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '8px',
    marginTop: '12px'
  },

  foto: {
    width: '100%',
    height: '90px',
    objectFit: 'cover',
    borderRadius: '10px',
    border: BORDE_DORADO_FINO
  },

  fotoPendiente: {
    minHeight: '90px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    boxSizing: 'border-box',
    textAlign: 'center',
    fontSize: '11px',
    color: '#94a3b8',
    background: 'rgba(148, 163, 184, 0.08)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    borderRadius: '10px'
  },

  textoSinFotos: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '10px'
  },

  avisoPublicado: {
    marginTop: '14px',
    padding: '10px',
    borderRadius: '10px',
    background: 'rgba(52, 211, 153, 0.08)',
    border: '1px solid rgba(52, 211, 153, 0.35)'
  },

  textoPublicado: {
    margin: 0,
    color: '#34d399',
    fontSize: '12px',
    fontWeight: '800',
    textAlign: 'center'
  },

  avisoPendiente: {
    marginTop: '14px',
    padding: '10px',
    borderRadius: '10px',
    background: 'rgba(148, 163, 184, 0.08)',
    border: '1px solid rgba(148, 163, 184, 0.25)'
  },

  textoPendiente: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '12px',
    textAlign: 'center'
  },

  tituloDesglose: {
    ...TEXTO_DORADO_BRILLO,
    fontSize: '12px',
    margin: '0 0 10px 0',
    textTransform: 'uppercase'
  },

  listaConceptos: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  filaConcepto: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },

  concepto: {
    fontSize: '12px',
    color: '#e2e8f0',
    maxWidth: '70%'
  },

  precioConcepto: {
    fontSize: '12px',
    color: COLOR_DORADO,
    fontWeight: 'bold'
  },

  botonEliminar: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
    color: '#fff',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: '14px',
    fontWeight: '900',
    fontSize: '12px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
    marginTop: '10px'
  }
};
