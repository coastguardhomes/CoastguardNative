import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PoliticaPrivacidad.css'; // O tus estilos Tailwind

export default function PoliticaPrivacidad() {
  const navigate = useNavigate();

  return (
    <div className="privacy-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: '#333' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: '20px', padding: '8px 16px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        ← Volver
      </button>

      <h1 style={{ color: '#00356b', textAlign: 'center', marginBottom: '20px' }}>POLÍTICA DE PRIVACIDAD</h1>

      <h3>1. RESPONSABLE DEL TRATAMIENTO DE LOS DATOS</h3>
      <ul>
        <li><strong>Identidad:</strong> Roxana Collazo Alonso</li>
        <li><strong>Nombre Comercial / Plataforma:</strong> CoastGuard Homes Services</li>
        <li><strong>NIF/NIE:</strong> Z1968154A</li>
        <li><strong>Domicilio profesional:</strong> Pilar de la Horadada (Alicante)</li>
        <li><strong>Correo electrónico de contacto:</strong> soporte@coastguardhomes.com *(o tu email)*</li>
      </ul>

      <h3>2. DATOS PERSONALES QUE RECOPILAMOS</h3>
      <p>A través de nuestra aplicación web y móvil, recopilamos y tratamos la siguiente información indispensable:</p>
      <ul>
        <li><strong>Datos de identificación:</strong> Nombre, apellidos, DNI/NIF/Pasaporte.</li>
        <li><strong>Datos de contacto:</strong> Correo electrónico, teléfono (para alertas y WhatsApp).</li>
        <li><strong>Datos del inmueble:</strong> Dirección postal exacta, características (tamaño, jardín, piscina) e imágenes adjuntas en los informes.</li>
        <li><strong>Datos de seguridad:</strong> Códigos de desactivación de alarmas y accesos (almacenados de forma encriptada).</li>
        <li><strong>Datos de facturación:</strong> Procesados de forma segura a través de nuestra pasarela de pago.</li>
      </ul>

      <h3>3. FINALIDAD DEL TRATAMIENTO</h3>
      <ol>
        <li><strong>Prestación del servicio:</strong> Gestionar la custodia de llaves, revisiones semanales y envío de informes.</li>
        <li><strong>Gestión administrativa y facturación:</strong> Procesar pagos mensuales y emitir facturas.</li>
        <li><strong>Atención y Emergencias:</strong> Atender comunicaciones urgentes por siniestros o averías.</li>
        <li><strong>Comunicaciones operativas:</strong> Enviar notificaciones críticas o de seguridad.</li>
      </ol>

      <h3>4. LEGITIMACIÓN PARA EL TRATAMIENTO</h3>
      <ul>
        <li><strong>Ejecución de un contrato:</strong> Necesario para el cumplimiento del Contrato Marco de servicios.</li>
        <li><strong>Consentimiento explícito:</strong> Mediante la marcación de la casilla de aceptación durante el registro.</li>
      </ul>

      <h3>5. PLAZO DE CONSERVACIÓN</h3>
      <p>Los datos se conservarán durante la vigencia de la relación comercial. Tras la baja, se bloquearán durante los plazos exigidos por la legislación fiscal española (5 años), destruyéndose de forma segura los códigos de alarma y copias de llaves inmediatamente.</p>

      <h3>6. DESTINATARIOS Y CESIÓN DE DATOS</h3>
      <p>No se cederán datos a terceros, salvo proveedores tecnológicos indispensables (servidores y pasarela de pago) o requerimiento legal de las Fuerzas de Seguridad.</p>

      <h3>7. DERECHOS DEL USUARIO (ARCO-POL)</h3>
      <p>Puedes ejercer tus derechos de acceso, rectificación, supresión y portabilidad enviando un correo a <strong>soporte@coastguardhomes.com</strong> adjuntando copia de tu DNI. Tienes derecho a reclamar ante la Agencia Española de Protección de Datos (AEPD).</p>

      <h3>8. MEDIDAS DE SEGURIDAD</h3>
      <p>Aplicamos medidas técnicas y organizativas rigurosas, con especial celo y cifrado en los códigos de alarma y accesos a los inmuebles.</p>
    </div>
  );
}
