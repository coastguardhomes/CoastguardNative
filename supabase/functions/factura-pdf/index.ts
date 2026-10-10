
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function fdRequest(url: string, apiKey: string, options: RequestInit = {}, step = "unknown") {
  const method = String(options.method || "GET").toUpperCase();
  const path = url.replace(/^https:\/\/app\.facturadirecta\.com\/api\/[A-Za-z0-9_-]+/, "");
  console.log("FD_CALL_START", JSON.stringify({step,method,path}));
  const response = await fetch(url, {
    ...options,
    headers: {
      "facturadirecta-api-key": apiKey,
      "accept-version": "1.0.9",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  console.log("FD_CALL_RESULT", JSON.stringify({step,method,path,status:response.status,ok:response.ok,message:data?.message,type:data?.type,code:data?.code}));
  if (!response.ok) throw new Error("FacturaDirecta " + response.status + ": " + (typeof data === "string" ? data : JSON.stringify(data)));
  return data;
}

async function findPaymentBank(companyUrl: string, apiKey: string): Promise<string> {
  const explicit = Deno.env.get("FACTURADIRECTA_BANK_ID") || "";
  if (explicit) return explicit;
  try {
    const methods = await fdRequest(companyUrl + "/paymentMethods?includeGlobal=true&limit=100", apiKey, {}, "paymentMethods");
    const methodItems = methods?.items || [];
    console.log("FD_PAYMENT_METHOD_DIAGNOSTIC", JSON.stringify(methodItems.map((item: any) => ({
      id: item?.uuid || item?.content?.uuid || null,
      title: item?.content?.main?.title || null,
      subtype: item?.content?.main?.subtype || null,
      direction: item?.content?.main?.direction || null,
      bank: item?.content?.main?.bank || null,
      gatewayBanks: Array.isArray(item?.content?.main?.details?.gateways)
        ? item.content.main.details.gateways.map((gateway: any) => gateway?.bank).filter(Boolean)
        : [],
    }))));
    const online = methodItems.find((item: any) =>
      item?.content?.main?.subtype === "online" &&
      (item?.content?.main?.bank || item?.content?.main?.details?.gateways?.[0]?.bank)
    );
    const onlineBank = online?.content?.main?.bank || online?.content?.main?.details?.gateways?.[0]?.bank;
    if (onlineBank) return onlineBank;
  } catch (e) { console.warn("No se pudo consultar paymentMethods:", e); }
  const banks = await fdRequest(companyUrl + "/banks?currency=EUR&sortBy=title&limit=100", apiKey, {}, "banks");
  const items = banks?.items || [];
  console.log("FD_BANK_DIAGNOSTIC", JSON.stringify(items.map((item: any) => ({
    id: item?.uuid || item?.content?.uuid || null,
    name: item?.content?.main?.name || item?.content?.main?.title || null,
    subtype: item?.content?.main?.subtype || null,
    currency: item?.content?.main?.currency || null,
    account: item?.content?.main?.account || null,
  }))));
  if (items.length === 1 && (items[0]?.uuid || items[0]?.content?.uuid)) {
    return String(items[0]?.uuid || items[0]?.content?.uuid);
  }
  throw new Error("No se pudo determinar la cuenta bancaria de FacturaDirecta. Hay " + items.length + " cuentas EUR disponibles y ningún método online válido; configura FACTURADIRECTA_BANK_ID con el ID ban_* de la cuenta que recibe los cobros de Stripe.");
}

async function getInvoiceSeries(companyUrl: string, apiKey: string): Promise<string> {
  const configured = Deno.env.get("FACTURADIRECTA_INVOICE_SERIES") || "";
  if (configured) return configured;
  const result = await fdRequest(companyUrl + "/settings/series/invoice", apiKey, {}, "invoice_series");
  const item = result?.items?.[0] || {};
  const series = item?.serie || item?.series || item?.id;
  if (!series) throw new Error("FacturaDirecta no devolvió ninguna serie de facturas.");
  return String(series);
}

async function getInvoiceTheme(companyUrl: string, apiKey: string): Promise<string> {
  const configured = Deno.env.get("FACTURADIRECTA_THEME_ID") || "";
  if (configured) return configured;
  const result = await fdRequest(companyUrl + "/settings/themes", apiKey, {}, "invoice_theme");
  const item = result?.items?.[0] || {};
  const theme = item?.id || item?.uuid;
  if (!theme) throw new Error("FacturaDirecta no devolvió ninguna plantilla de factura.");
  return String(theme);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ error: "No autenticado." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseKey) {
      return json({ error: "Faltan credenciales internas de Supabase." }, 500);
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseKey);

    let authorized = false;
    if (token === supabaseKey) {
      authorized = true;
    } else {
      const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);
      if (authError || !authData?.user) {
        // Las llamadas servidor-a-servidor usan la clave service_role, no una sesión de usuario.
        // getClaims valida criptográficamente el JWT y evita confiar solo en un claim decodificado.
        const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
        authorized = !claimsError && claimsData?.claims?.role === "service_role";
        if (!authorized) return json({ error: "Sesión no válida." }, 401);
      } else {
        const { data: profile } = await supabaseAuth
          .from("profiles")
          .select("rol")
          .eq("id", authData.user.id)
          .maybeSingle();

        authorized = profile?.rol === "admin";
      }
    }

    if (!authorized) return json({ error: "No autorizado." }, 403);

    const facturaId = Number(body.facturaId || body.factura_id || body.id);
    if (!facturaId) return json({ error: "Falta el ID de la factura" }, 400);
    // Los webhooks deben aportar el importe cobrado. Para reintentos manuales desde
    // el panel, solo se permite continuar si el contrato vinculado ya consta pagado.
    const esReintentoAdmin = body.pagoConfirmado !== true;

    const fdApiKey = Deno.env.get("FACTURADIRECTA_API_KEY") || "";
    const fdCompanyId = Deno.env.get("FACTURADIRECTA_COMPANY_ID") || "";
    if (!supabaseUrl || !supabaseKey) throw new Error("Faltan credenciales internas de Supabase.");


    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: factura, error: facturaError } = await supabase.from("facturas").select("*").eq("id", facturaId).limit(1).maybeSingle();
    if (facturaError) throw new Error(facturaError.message);
    if (!factura) throw new Error("Factura no encontrada.");

    let esFacturaExtra = false;
    if (!factura.contrato_id) {
      const { data: extrasFactura, error: extrasFacturaError } = await supabase
        .from("extras")
        .select("id")
        .eq("factura_id", facturaId)
        .limit(1);
      if (extrasFacturaError) throw new Error("No se pudo verificar si la factura pertenece a un extra: " + extrasFacturaError.message);
      esFacturaExtra = Array.isArray(extrasFactura) && extrasFactura.length > 0;
    }

    // La pantalla de listado usa esta función para abrir un PDF ya emitido.
    // Si existe pdf_url y no hay confirmación de pago, devolverlo sin reenviar
    // correo ni registrar otro pago en FacturaDirecta.
    if (esReintentoAdmin && Number(body.id) === facturaId) {
      const existingPdfUrl = String(factura.pdf_url || "").trim();
      if (!existingPdfUrl) {
        return json({
          ok: false,
          error: "Esta factura todavía no tiene PDF fiscal. La consulta del documento no inicia cobros ni reenvía facturas.",
        }, 409);
      }
      return json({
        ok: true,
        factura_id: facturaId,
        pdf_url: existingPdfUrl,
        url: existingPdfUrl,
        existing: true,
        email_sent: false,
      });
    }

    if (!fdApiKey || !fdCompanyId) throw new Error("Faltan las credenciales de FacturaDirecta.");

    let cliente: any = {};
    if (factura.cliente_id) {
      const { data: clienteData, error: clienteError } = await supabase.from("clientes").select("*").eq("id", factura.cliente_id).limit(1).maybeSingle();
      if (clienteError) throw new Error("No se pudo obtener el cliente: " + clienteError.message);
      cliente = clienteData || {};
    }

    const companyUrl = "https://app.facturadirecta.com/api/" + fdCompanyId;
    const tag = "coastguard-factura-" + facturaId;
    const externalId = String(cliente.id || factura.cliente_id || "");
    const fiscalId = String(cliente.dni || cliente.cif || "").replace(/[ .-]/g, "");
    let contact: any = null;

    if (externalId) {
      const result = await fdRequest(companyUrl + "/contacts?externalId=" + encodeURIComponent(externalId) + "&limit=1", fdApiKey, {}, "contact_externalId");
      contact = result?.items?.[0]?.content || null;
    }
    if (!contact && fiscalId) {
      const result = await fdRequest(companyUrl + "/contacts?fiscalId=" + encodeURIComponent(fiscalId) + "&limit=1", fdApiKey, {}, "contact_fiscalId");
      contact = result?.items?.[0]?.content || null;
    }
    if (!contact && cliente.email) {
      const result = await fdRequest(companyUrl + "/contacts?search=" + encodeURIComponent(cliente.email) + "&limit=10", fdApiKey, {}, "contact_email");
      contact = result?.items?.find((item: any) => item?.content?.main?.email === cliente.email)?.content || null;
    }

    if (!contact) {
      const main: any = {
        name: cliente.nombre || "Cliente General",
        email: cliente.email || undefined,
        phone: cliente.telefono || undefined,
        address: cliente.direccion || undefined,
        country: "ES",
        externalId: externalId || undefined,
      };
      if (fiscalId) { main.fiscalId = fiscalId; main.fiscalIdCountry = "ES"; }
      let clientAccountForContact = Deno.env.get("FACTURADIRECTA_CLIENT_ACCOUNT") || "";
      if (!clientAccountForContact) {
        try {
          const existingClients = await fdRequest(companyUrl + "/contacts?isClient=true&limit=1", fdApiKey, {}, "default_client_account");
          clientAccountForContact = String(existingClients?.items?.[0]?.content?.main?.accounts?.client || "").trim();
        } catch (e) {
          console.warn("No se pudo obtener una cuenta de cliente existente:", e);
        }
      }
      if (!clientAccountForContact || !/^[0-9]{6}$/.test(clientAccountForContact)) {
        clientAccountForContact = "430000";
      }
      main.accounts = { client: clientAccountForContact };
      try {
        const created = await fdRequest(companyUrl + "/contacts", fdApiKey, {
          method:"POST",
          body:JSON.stringify({content:{type:"contact",main:{...main,currency:"EUR"}}}),
        });
        contact = created?.content || null;
      } catch (createError) {
        const message = String(createError?.message || "");
        if (message.includes("FacturaDirecta 409") && fiscalId) {
          const retry = await fdRequest(companyUrl + "/contacts?fiscalId=" + encodeURIComponent(fiscalId) + "&limit=1", fdApiKey, {}, "contact_after_duplicate");
          contact = retry?.items?.[0]?.content || null;
        }
        if (!contact) throw createError;
      }
    }

    const contactId = contact?.uuid;
    if (!contactId) throw new Error("No se pudo obtener el contacto de FacturaDirecta.");

    // FacturaDirecta usa 430000 como cuenta base de clientes.
    // No usamos subcuentas numéricas como 430001.
    let validClientAccount = String(contact?.main?.accounts?.client || "").trim();
    if (!/^430[0-9]{3}$/.test(validClientAccount) || validClientAccount === "430001") {
      validClientAccount = "430000";
    }

    if (validClientAccount !== String(contact?.main?.accounts?.client || "").trim()) {
      const updatedMain = {
        ...(contact?.main || {}),
        accounts: {
          ...(contact?.main?.accounts || {}),
          client: validClientAccount,
        },
      };
      const updated = await fdRequest(
        companyUrl + "/contacts/" + contactId,
        fdApiKey,
        {
          method: "PUT",
          body: JSON.stringify({
            content: {
              ...(contact || {}),
              type: "contact",
              main: updatedMain,
            },
          }),
        },
        "repair_contact_account"
      );
      contact = updated?.content || updated || contact;
    }

    const configuredTaxId = Deno.env.get("FACTURADIRECTA_TAX_ID") || "";
    let taxId = configuredTaxId;
    if (esFacturaExtra) {
      // En extras validamos que el impuesto sea IVA 21% manual, no automático,
      // para que VeriFactu no aplique una segunda regla fiscal a la misma línea.
      const taxes = await fdRequest(companyUrl + "/settings/taxes/sales", fdApiKey, {}, "sales_taxes");
      const taxItems = taxes?.items || [];
      const validIva21 = (tax:any) =>
        tax?.current === true &&
        tax?.taxGroup === "IVA" &&
        Math.abs(Number(tax?.value)-0.21)<0.0001 &&
        tax?.autoApplied !== true;
      const iva21 = taxItems.find(validIva21);
      if (configuredTaxId) {
        const configuredTax = taxItems.find((tax:any) =>
          String(tax?.id || tax?.uuid || "") === configuredTaxId
        );
        if (!configuredTax || !validIva21(configuredTax)) {
          throw new Error("FACTURADIRECTA_TAX_ID no corresponde a un impuesto de ventas IVA 21% válido y no automático.");
        }
        taxId = configuredTaxId;
      } else {
        taxId = iva21?.id || iva21?.uuid || "";
      }
    } else if (!taxId) {
      // Mantener sin cambios la selección de impuesto para facturas contractuales.
      const taxes = await fdRequest(companyUrl + "/settings/taxes/sales", fdApiKey, {}, "sales_taxes");
      const iva21 = (taxes?.items || []).find((tax:any) => tax?.current === true && tax?.taxGroup === "IVA" && Math.abs(Number(tax?.value)-0.21)<0.0001 && tax?.autoApplied !== true);
      taxId = iva21?.id || iva21?.uuid || "";
    }
    if (!taxId) throw new Error("No se encontró un impuesto de ventas IVA 21% válido.");
    
    const total = Number(factura.total ?? 0);
    // En extras, total ya incluye el IVA calculado al crear la factura.
    // FacturaDirecta debe extraer el IVA de ese precio, no volver a sumarlo.
    const base = esFacturaExtra
      ? Math.round((total / 1.21) * 100) / 100
      : Number(factura.base ?? factura.monto ?? 0);
    let amountPaid: number;
    if (esReintentoAdmin) {
      if (!factura.contrato_id) throw new Error("Reintento bloqueado: la factura no tiene un contrato vinculado que permita verificar el pago.");
      const { data: contratoPagado, error: contratoError } = await supabase.from("contratos").select("pagado,precio_total").eq("id", factura.contrato_id).maybeSingle();
      if (contratoError) throw new Error("No se pudo verificar el contrato pagado: " + contratoError.message);
      if (contratoPagado?.pagado !== true) return json({ok:false,error:"No se reenvía la factura porque el contrato no consta pagado."},409);
      amountPaid = Number(body.amountPaid ?? contratoPagado.precio_total);
    } else {
      amountPaid = Number(body.amountPaid ?? total);
    }
    if (!Number.isFinite(amountPaid) || amountPaid <= 0 || amountPaid > total + 0.01) throw new Error("El importe cobrado por Stripe no es válido para esta factura.");
    if (!Number.isFinite(base) || base < 0 || !Number.isFinite(total) || total <= 0) throw new Error("Los importes de la factura no son válidos.");

    const invoiceLookup = await fdRequest(
      companyUrl + "/invoices?draft=all&limit=100",
      fdApiKey,
      {},
      "invoice_lookup"
    );
    let fdInvoice = (invoiceLookup?.items || [])
      .find((item:any) => Array.isArray(item?.tags) && item.tags.includes(tag))
      ?.content || null;

    if (!fdInvoice) {
      const series = await getInvoiceSeries(companyUrl, fdApiKey);
      const theme = await getInvoiceTheme(companyUrl, fdApiKey);
      const account = Deno.env.get("FACTURADIRECTA_ACCOUNT") || "700000";
      const clientAccount = String(contact?.main?.accounts?.client || "").trim();
      const clientCreditAccount = String(contact?.main?.accounts?.clientCredit || "").trim();
      if (!/^430/.test(clientAccount)) {
        throw new Error("El cliente de FacturaDirecta no tiene una cuenta contable de cliente válida existente.");
      }

      const configuredFiscalPosition = Deno.env.get("FACTURADIRECTA_FISCAL_POSITION") || "";
      const fiscalPosition = configuredFiscalPosition ||
        (/^[0-9XYZ]/i.test(fiscalId) ? "ind" : "emp");
      const invoicePayload = {
        content:{type:"invoice",main:{
          contact:contactId,
          date:String(factura.fecha || new Date().toISOString().slice(0,10)).slice(0,10),
          dueDate:String(factura.fecha || new Date().toISOString().slice(0,10)).slice(0,10),
          currency:"EUR",
          exchangeRate:1,
          docNumber:{series},
          fiscalPosition,
          account,
          theme,
          draft:false,
          voided:false,
          simplified:false,
          ...(esFacturaExtra ? {taxIncludedPrices:true} : {}),
          lines:[esFacturaExtra
            ? {account,quantity:1,unitPrice:total,discount:0,discountRate:0,lineTotal:total,tax:[taxId],text:factura.descripcion || "Servicio Coastguard Homes"}
            : {account,quantity:1,unitPrice:base,discount:0,discountRate:0,lineTotal:base,tax:[taxId],text:factura.descripcion || "Servicio Coastguard Homes"}]
        }},
        tags:[tag]
      };
      const fdResult = await fdRequest(companyUrl + "/invoices", fdApiKey, {method:"POST",body:JSON.stringify(invoicePayload)}, "invoice_create");
      fdInvoice = fdResult?.content || fdResult;
    }

    // Para extras, impedir que se registre el pago si FacturaDirecta devuelve
    // una factura (nueva o reutilizada por tag) con un total distinto al de Coastguard.
    // Las facturas contractuales conservan el flujo previo sin cambios.
    if (esFacturaExtra && fdInvoice?.main?.total !== undefined && fdInvoice?.main?.total !== null) {
      const totalFacturaDirecta = Number(fdInvoice.main.total);
      if (!Number.isFinite(totalFacturaDirecta) || Math.abs(totalFacturaDirecta - total) > 0.02) {
        throw new Error(
          "La factura de FacturaDirecta del extra tiene un total (" +
          String(fdInvoice.main.total) +
          " €) distinto al total de Coastguard (" +
          total.toFixed(2) +
          " €). No se ha registrado el pago para evitar confirmar un importe incorrecto."
        );
      }
    }

    const fdInvoiceId = fdInvoice?.uuid;
    const fdNumber = fdInvoice?.main?.docNumber?.number ? String(fdInvoice.main.docNumber.number) : (fdInvoice?.main?.docNumber?.series || factura.numero);
    if (!fdInvoiceId) throw new Error("FacturaDirecta no devolvió el ID de la factura.");

    // FacturaDirecta devuelve el PDF mediante una URL temporal. Generamos el PDF
    // con un modo válido y lo copiamos a nuestro bucket permanente para que
    // el cliente pueda verlo desde Coastguard sin depender de la URL temporal.
    let storedPdfUrl = String(factura.pdf_url || "").trim();
    if (!storedPdfUrl) {
      const pdfResult = await fdRequest(
        companyUrl + "/invoices/" + fdInvoiceId + "/pdf",
        fdApiKey,
        { method:"PUT", body:JSON.stringify({mode:"attachment"}) },
        "invoice_pdf"
      );
      const temporaryPdfUrl = String(pdfResult?.url || "").trim();
      if (!temporaryPdfUrl) throw new Error("FacturaDirecta no devolvió la URL del PDF.");
      const pdfResponse = await fetch(temporaryPdfUrl);
      if (!pdfResponse.ok) throw new Error("No se pudo descargar el PDF generado por FacturaDirecta: " + pdfResponse.status);
      const pdfBytes = new Uint8Array(await pdfResponse.arrayBuffer());
      const storagePath = "facturas/" + facturaId + "/factura-" + fdInvoiceId + ".pdf";
      const { error: uploadError } = await supabase.storage
        .from("facturas")
        .upload(storagePath, pdfBytes, {
          contentType:"application/pdf",
          cacheControl:"31536000",
          upsert:true
        });
      if (uploadError) throw new Error("No se pudo guardar el PDF de FacturaDirecta en Storage: " + uploadError.message);
      const { data: publicUrlData } = supabase.storage.from("facturas").getPublicUrl(storagePath);
      storedPdfUrl = String(publicUrlData?.publicUrl || "").trim();
      if (!storedPdfUrl) throw new Error("No se pudo obtener la URL pública del PDF.");
      const { error: pdfDbError } = await supabase.from("facturas").update({pdf_url:storedPdfUrl}).eq("id",facturaId);
      if (pdfDbError) throw new Error("No se pudo guardar la URL del PDF en la factura: " + pdfDbError.message);
    }

    const customerEmail = String(cliente.email || factura.email || "").trim();
    if (!customerEmail) throw new Error("No hay email del cliente para enviar la factura.");

    let resendFallbackSent = false;
    let paymentRegistered = false;
    let paymentError = "";
    const fdState = String(fdInvoice?.state || fdInvoice?.main?.state || "").toLowerCase();
    const localPaymentState = String(factura.estado_pago || "").toLowerCase();
    const localInvoiceState = String(factura.estado || "").toLowerCase();
    const alreadyProcessedPayment =
      localPaymentState === "parcial" ||
      localPaymentState === "pagada" ||
      localInvoiceState === "pagada";
    const alreadyPaidInFacturadirecta = fdState === "paid" || fdState === "overpaid";

    // Registrar el pago antes del correo y actualizar Supabase. Si el envío falla,
    // Stripe podrá reintentar sin volver a registrar el mismo pago.
    if (!alreadyProcessedPayment && !alreadyPaidInFacturadirecta) {
      const bankId = await findPaymentBank(companyUrl, fdApiKey);
      await fdRequest(
        companyUrl + "/invoices/" + fdInvoiceId + "/payments",
        fdApiKey,
        {
          method: "POST",
          body: JSON.stringify({
            payments: [{
              date: new Date().toISOString().slice(0, 10),
              bank: bankId,
              amount: amountPaid,
            }],
          }),
        },
        "register_payment",
      );
      paymentRegistered = true;
    } else {
      paymentRegistered = true;
    }

    const fullyPaid =
      alreadyPaidInFacturadirecta ||
      localPaymentState === "pagada" ||
      localInvoiceState === "pagada" ||
      amountPaid >= total - 0.01;
    const { error: updateError } = await supabase
      .from("facturas")
      .update({
        numero: fdNumber,
        estado: fullyPaid ? "pagada" : "pendiente",
        estado_pago: fullyPaid ? "pagada" : "parcial",
      })
      .eq("id", facturaId);
    if (updateError) {
      throw new Error("FacturaDirecta registró el pago, pero no se pudo actualizar Coastguard: " + updateError.message);
    }

    // Primero intentamos el envío oficial de FacturaDirecta. Si falla, enviamos
    // el mismo PDF por Resend para que el cliente no se quede sin la factura.
    try {
      await fdRequest(
        companyUrl + "/invoices/" + fdInvoiceId + "/send",
        fdApiKey,
        {
          method: "PUT",
          body: JSON.stringify({
            to: [customerEmail],
            subject: "Factura " + fdNumber + " - Coastguard Homes",
            html: "Hola " + (cliente.nombre || "Cliente") + ",<br><br>Adjuntamos su factura legal de Coastguard Homes.<br><br>Gracias por confiar en nosotros.<br><br>Coastguard Homes",
            sendFacturae: false,
            continueWithoutFacturae: true,
          }),
        },
        "send_invoice",
      );
    } catch (fdSendError) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
      if (!resendApiKey) throw fdSendError;

      const pdfResponse = await fetch(storedPdfUrl);
      if (!pdfResponse.ok) {
        throw new Error("FacturaDirecta no pudo enviar el correo y tampoco se pudo descargar el PDF para el envío alternativo: " + pdfResponse.status);
      }
      const pdfBytes = new Uint8Array(await pdfResponse.arrayBuffer());
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < pdfBytes.length; i += chunkSize) {
        binary += String.fromCharCode(...pdfBytes.subarray(i, i + chunkSize));
      }
      const pdfBase64 = btoa(binary);
      const safeName = String(cliente.nombre || "Cliente").replace(/[&<>"']/g, (char: string) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
      }[char] || char));
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + resendApiKey },
        body: JSON.stringify({
          from: "Coastguard Homes <administracion@coastguardhomes.es>",
          to: [customerEmail],
          subject: "Factura " + fdNumber + " - Coastguard Homes",
          html: "<div style=\"font-family:Arial,sans-serif;color:#172033\"><p>Hola " + safeName + ",</p><p>Adjuntamos su factura legal de Coastguard Homes.</p><p>Gracias por confiar en nosotros.</p><p>Coastguard Homes</p></div>",
          attachments: [{ filename: "factura-" + String(fdNumber).replace(/[^a-zA-Z0-9._-]/g, "_") + ".pdf", content: pdfBase64 }],
        }),
      });
      const resendText = await resendResponse.text();
      if (!resendResponse.ok) {
        console.error("RESEND_FALLBACK_FAILED", JSON.stringify({ status: resendResponse.status, response: resendText }));
        throw new Error("Falló el envío por FacturaDirecta y también el envío alternativo por Resend: " + resendText);
      }
      resendFallbackSent = true;
      console.warn("RESEND_FALLBACK_SENT", JSON.stringify({ facturaId, email: customerEmail, reason: String((fdSendError as any)?.message || fdSendError) }));
    }

    return json({ok:true,factura_id:facturaId,pdf_url:storedPdfUrl,facturadirecta:{id:fdInvoiceId,numero:fdNumber,state:paymentRegistered?(fullyPaid?"paid":"partially_paid"):(fdState||"open")},payment_registered:paymentRegistered,amount_paid:amountPaid,amount_due:Math.max(0,Number((total-amountPaid).toFixed(2))),email_sent:true,email_provider:resendFallbackSent?"resend":"facturadirecta",resend_fallback_sent:resendFallbackSent,payment_error:paymentError||null});
  } catch(err:any) {
    console.error("FD_FATAL",JSON.stringify({message:err?.message||String(err)}));
    return json({error:err?.message||"Error interno"},500);
  }
});
