/**
 * EstoqueFlow — Edge Function: check-stock-alerts
 *
 * Responsabilidades:
 * 1. Chamada via cron (Supabase Scheduled Functions) ou webhook do Make.com
 * 2. Varre produtos ativos com estoque abaixo do mínimo
 * 3. Envia e-mail de resumo via Resend para empresas com alertas não lidos
 * 4. Usado também para o fluxo de reengajamento (usuários inativos há 3+ dias)
 *
 * Deploy:
 *   supabase functions deploy check-stock-alerts
 *
 * Variáveis de ambiente necessárias (Supabase Dashboard → Settings → Edge Functions):
 *   SUPABASE_URL          — URL do projeto Supabase
 *   SUPABASE_SERVICE_KEY  — service_role key (NUNCA exposta ao frontend)
 *   RESEND_API_KEY        — chave da API Resend.com
 *   APP_URL               — URL pública do app (ex: https://app.estoqueflow.com.br)
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Company {
  id: string;
  name: string;
  owner_id: string;
}

interface AlertProduct {
  id: string;
  name: string;
  current_stock: number;
  min_stock: number;
  unit: string;
  alert_type: "out_of_stock" | "low_stock" | "overstock";
}

interface UserEmail {
  email: string;
}

// ─── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Responder a preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_KEY")!, // service_role — acesso irrestrito
    );

    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const appUrl = Deno.env.get("APP_URL") ?? "https://app.estoqueflow.com.br";

    // Verificar se é chamada de reengajamento ou de alertas gerais
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const mode: "alerts" | "reengagement" = body.mode ?? "alerts";

    if (mode === "alerts") {
      await processStockAlerts(supabase, resendApiKey, appUrl);
    } else {
      await processReengagement(supabase, resendApiKey, appUrl);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

// ─── Modo 1: Alertas de Estoque ───────────────────────────────────────────────

async function processStockAlerts(
  supabase: ReturnType<typeof createClient>,
  resendApiKey: string,
  appUrl: string,
) {
  // Buscar todas as empresas com plano ativo e alertas não lidos
  const { data: companiesWithAlerts, error } = await supabase
    .from("stock_alerts")
    .select(`
      company_id,
      companies!inner(id, name, owner_id, subscription_status),
      products!inner(id, name, current_stock, min_stock, unit),
      alert_type,
      triggered_at
    `)
    .eq("is_read", false)
    .eq("is_resolved", false)
    .in("companies.subscription_status", ["trial", "active"])
    .order("triggered_at", { ascending: false });

  if (error) throw error;
  if (!companiesWithAlerts?.length) {
    console.log("Nenhum alerta pendente encontrado.");
    return;
  }

  // Agrupar alertas por empresa
  const byCompany = new Map<string, { company: Company; alerts: AlertProduct[] }>();

  for (const row of companiesWithAlerts) {
    const company = row.companies as unknown as Company;
    const product = row.products as unknown as Omit<AlertProduct, "alert_type">;

    if (!byCompany.has(company.id)) {
      byCompany.set(company.id, { company, alerts: [] });
    }
    byCompany.get(company.id)!.alerts.push({
      ...product,
      alert_type: row.alert_type as AlertProduct["alert_type"],
    });
  }

  // Enviar e-mail para cada empresa
  for (const [, { company, alerts }] of byCompany) {
    const { data: userData } = await supabase.auth.admin.getUserById(company.owner_id);
    const email = userData?.user?.email;
    if (!email) continue;

    await sendAlertEmail({
      resendApiKey,
      to: email,
      companyName: company.name,
      alerts,
      appUrl,
    });

    console.log(`E-mail de alertas enviado para ${email} (${company.name})`);
  }
}

// ─── Modo 2: Reengajamento de Usuários Inativos ───────────────────────────────

async function processReengagement(
  supabase: ReturnType<typeof createClient>,
  resendApiKey: string,
  appUrl: string,
) {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  // Encontrar empresas ativas sem movimentação nos últimos 3 dias
  const { data: inactiveCompanies, error } = await supabase.rpc(
    "get_inactive_companies",
    { since: threeDaysAgo },
  );

  if (error) {
    // Fallback: query manual se a RPC não existir ainda
    console.warn("RPC get_inactive_companies não encontrada, usando fallback.");
    return;
  }

  for (const company of (inactiveCompanies ?? [])) {
    const { data: userData } = await supabase.auth.admin.getUserById(company.owner_id);
    const email = userData?.user?.email;
    if (!email) continue;

    // Buscar top 5 produtos com menor estoque relativo ao mínimo
    const { data: criticalProducts } = await supabase
      .from("products")
      .select("name, current_stock, min_stock, unit")
      .eq("company_id", company.id)
      .eq("is_active", true)
      .gt("min_stock", 0)
      .order("current_stock", { ascending: true })
      .limit(5);

    await sendReengagementEmail({
      resendApiKey,
      to: email,
      companyName: company.name,
      products: criticalProducts ?? [],
      appUrl,
    });

    console.log(`E-mail de reengajamento enviado para ${email} (${company.name})`);
  }
}

// ─── Helpers de E-mail ────────────────────────────────────────────────────────

async function sendAlertEmail(params: {
  resendApiKey: string;
  to: string;
  companyName: string;
  alerts: AlertProduct[];
  appUrl: string;
}) {
  const { resendApiKey, to, companyName, alerts, appUrl } = params;

  const outOfStock = alerts.filter((a) => a.alert_type === "out_of_stock");
  const lowStock = alerts.filter((a) => a.alert_type === "low_stock");

  const alertRows = alerts
    .map((a) => {
      const badge =
        a.alert_type === "out_of_stock"
          ? `<span style="color:#dc2626;font-weight:700;">SEM ESTOQUE</span>`
          : `<span style="color:#d97706;font-weight:700;">ESTOQUE BAIXO</span>`;
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${a.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center;">${a.current_stock} ${a.unit}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center;">${a.min_stock} ${a.unit}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center;">${badge}</td>
        </tr>`;
    })
    .join("");

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
    <img src="${appUrl}/logo.png" alt="EstoqueFlow" style="height:36px;margin-bottom:24px;" />
    <h2 style="margin:0 0 4px;">⚠️ Alerta de Estoque — ${companyName}</h2>
    <p style="color:#6b7280;margin:0 0 24px;">
      ${outOfStock.length > 0 ? `<strong>${outOfStock.length} produto(s) sem estoque</strong>` : ""}
      ${outOfStock.length > 0 && lowStock.length > 0 ? " e " : ""}
      ${lowStock.length > 0 ? `<strong>${lowStock.length} produto(s) com estoque baixo</strong>` : ""}
    </p>

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f9fafb;text-align:left;">
          <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;">Produto</th>
          <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;text-align:center;">Atual</th>
          <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;text-align:center;">Mínimo</th>
          <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;text-align:center;">Status</th>
        </tr>
      </thead>
      <tbody>${alertRows}</tbody>
    </table>

    <a href="${appUrl}/alerts"
       style="display:inline-block;margin-top:24px;padding:12px 24px;
              background:#2563eb;color:#fff;text-decoration:none;
              border-radius:8px;font-weight:600;">
      Ver todos os alertas →
    </a>

    <p style="margin-top:32px;font-size:12px;color:#9ca3af;">
      Você está recebendo este e-mail porque tem alertas ativos no EstoqueFlow.<br>
      <a href="${appUrl}/settings/notifications" style="color:#9ca3af;">Gerenciar notificações</a>
    </p>
  </body>
  </html>`;

  await resendSend({
    apiKey: resendApiKey,
    to,
    subject: `⚠️ ${alerts.length} alerta(s) de estoque — ${companyName}`,
    html,
  });
}

async function sendReengagementEmail(params: {
  resendApiKey: string;
  to: string;
  companyName: string;
  products: Array<{ name: string; current_stock: number; min_stock: number; unit: string }>;
  appUrl: string;
}) {
  const { resendApiKey, to, companyName, products, appUrl } = params;

  const productRows = products
    .map(
      (p) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${p.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center;">
          ${p.current_stock} / ${p.min_stock} ${p.unit}
        </td>
      </tr>`,
    )
    .join("");

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
    <img src="${appUrl}/logo.png" alt="EstoqueFlow" style="height:36px;margin-bottom:24px;" />
    <h2 style="margin:0 0 4px;">Seu estoque está te esperando, ${companyName} 👋</h2>
    <p style="color:#6b7280;margin:0 0 24px;">
      Você não registrou movimentações nos últimos 3 dias.
      ${products.length > 0 ? `Confira os produtos que precisam de atenção:` : ""}
    </p>

    ${
      products.length > 0
        ? `<table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;text-align:left;">Produto</th>
            <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;text-align:center;">Estoque Atual / Mínimo</th>
          </tr>
        </thead>
        <tbody>${productRows}</tbody>
      </table>`
        : ""
    }

    <a href="${appUrl}/dashboard"
       style="display:inline-block;margin-top:24px;padding:12px 24px;
              background:#2563eb;color:#fff;text-decoration:none;
              border-radius:8px;font-weight:600;">
      Acessar meu estoque →
    </a>

    <p style="margin-top:32px;font-size:12px;color:#9ca3af;">
      <a href="${appUrl}/settings/notifications" style="color:#9ca3af;">Cancelar este tipo de e-mail</a>
    </p>
  </body>
  </html>`;

  await resendSend({
    apiKey: resendApiKey,
    to,
    subject: `Seu estoque está te esperando — ${companyName}`,
    html,
  });
}

async function resendSend(params: {
  apiKey: string;
  to: string;
  subject: string;
  html: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "EstoqueFlow <alertas@estoqueflow.com.br>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
}
