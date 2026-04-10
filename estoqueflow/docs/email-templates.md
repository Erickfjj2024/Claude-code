# EstoqueFlow — Templates de E-mail (Sequência de Onboarding)

Todos os e-mails são disparados via **Resend.com** + **Make.com** (automação).
Remetente padrão: `EstoqueFlow <oi@estoqueflow.com.br>`

---

## E-mail 1 — Boas-vindas (Disparo: imediato após cadastro)

**Assunto:** `Bem-vindo ao EstoqueFlow, {{first_name}}! Seu estoque agora é inteligente 🎉`

```
Olá, {{first_name}}!

Seu trial gratuito de 14 dias começou agora. Aqui está o que você pode fazer nos
próximos 5 minutos:

  ✅  Cadastrar seu primeiro produto
  ✅  Definir o estoque mínimo
  ✅  Ver o alerta de estoque baixo em tempo real

Acesse agora: {{app_url}}/onboarding

Se precisar de ajuda para importar sua planilha de produtos, responda este e-mail
que te ajudo pessoalmente em até 2 horas.

Abraço,
Erick (fundador do EstoqueFlow)

P.S. Quer pular a fila e fazer o setup em 30 minutos comigo via videochamada?
→ {{calendly_link}}
```

---

## E-mail 2 — Dica de Uso (Disparo: D+1 após cadastro)

**Assunto:** `Uma dica que vai mudar como você controla seu estoque`

```
Olá, {{first_name}}!

Muitos dos nossos clientes passaram anos perdendo dinheiro com produto vencendo
na prateleira ou vendendo algo que estava zerado no estoque.

O EstoqueFlow resolve isso com 3 campos simples:

  📦  Estoque atual — quantas unidades você tem agora
  ⚠️  Estoque mínimo — a partir de quantas unidades quer ser alertado
  📬  E-mail de alerta — receba antes de acabar, não depois

Tem 2 minutos agora? Complete o cadastro dos seus produtos principais:
→ {{app_url}}/products/new

Qualquer dúvida, é só responder.

Erick
```

---

## E-mail 3 — Social Proof (Disparo: D+3)

**Assunto:** `Como a Padaria do Seu João parou de perder R$800/mês`

```
Olá, {{first_name}}!

O Seu João tem uma padaria no interior de SP. Ele controlava o estoque no caderno
e toda semana faltava farinha de trigo no momento errado.

Depois de 2 semanas usando o EstoqueFlow:
→ Zero ruptura de estoque em produtos críticos
→ Pedido ao fornecedor feito 3 dias antes, não depois que acabou
→ R$800/mês a menos em compras de emergência no mercadinho da esquina

Isso acontece porque o sistema avisa quando o estoque está chegando no mínimo —
não quando já acabou.

Seu trial ainda tem {{days_remaining}} dias.

Configure os alertas dos seus produtos agora:
→ {{app_url}}/products

Erick
```

---

## E-mail 4 — Trial Expirando em 7 dias (Disparo: D+7)

**Assunto:** `7 dias para o fim do seu trial — veja o que você economizou`

```
Olá, {{first_name}}!

Você está na metade do seu período gratuito. Veja o que aconteceu na sua conta:

  📦  {{products_count}} produtos cadastrados
  📊  {{movements_count}} movimentações registradas
  ⚠️  {{alerts_count}} alertas de estoque gerados

Cada alerta é um possível problema evitado antes de chegar ao cliente.

Quando o trial acabar, você pode continuar com:

  Starter (R$97/mês) — até 150 produtos, 1 usuário
  Professional (R$197/mês) — produtos ilimitados, 3 usuários + relatórios
  Business (R$397/mês) — tudo ilimitado + API + suporte prioritário

Garantir seu plano agora:
→ {{app_url}}/upgrade

Qualquer dúvida sobre qual plano faz mais sentido pro seu negócio,
responde este e-mail.

Erick
```

---

## E-mail 5 — Último Dia do Trial (Disparo: D+13)

**Assunto:** `Amanhã seu trial acaba — R$20 de desconto se assinar hoje`

```
Olá, {{first_name}},

Seu trial gratuito encerra amanhã.

Para não perder o acesso ao seu histórico de movimentações e alertas,
assine hoje e ganhe R$20 de desconto no primeiro mês.

Use o cupom: TRIAL20
Válido apenas até meia-noite de hoje.

→ {{app_url}}/upgrade?coupon=TRIAL20

Se o EstoqueFlow não foi útil para você, me conta o motivo respondendo este e-mail.
Sua opinião vai me ajudar a melhorar o produto.

Erick

P.S. Se precisar de mais uma semana para decidir, é só pedir. Consigo estender
sem problema.
```

---

## E-mail 6 — Pós-Assinatura: Como Usar Tudo (Disparo: imediato após upgrade)

**Assunto:** `Obrigado! Aqui está seu guia completo do plano {{plan_name}}`

```
Olá, {{first_name}}!

Seja bem-vindo ao plano {{plan_name}}! Aqui está tudo que você tem disponível:

BÁSICO (todos os planos):
  ✅  Cadastro ilimitado de movimentações
  ✅  Alertas de estoque em tempo real
  ✅  Importação de planilha CSV
  ✅  Dashboard com visão geral

{{#if professional_or_higher}}
PROFISSIONAL:
  ✅  Relatório de Valorização de Estoque (PDF)
  ✅  Histórico completo com filtros avançados
  ✅  Convidar até 3 usuários (ex: funcionários)
  ✅  Exportar dados para Excel
{{/if}}

{{#if business}}
BUSINESS:
  ✅  API REST para integração com seu sistema
  ✅  Usuários ilimitados
  ✅  Suporte via WhatsApp (resposta em 2h)
  ✅  Relatórios customizados
{{/if}}

Acesse agora: {{app_url}}/dashboard

Qualquer dúvida, estou disponível respondendo este e-mail.

Erick
```

---

## Configuração no Make.com

### Cenário 1 — Sequência de Onboarding

```
Trigger: Supabase Webhook → INSERT em companies
  ↓
Delay: 0 min → Enviar E-mail 1 (boas-vindas)
  ↓
Delay: 24h → Enviar E-mail 2 (dica de uso)
  ↓
Delay: 72h → Enviar E-mail 3 (social proof)
  ↓
Delay: 7 dias → Enviar E-mail 4 (trial expirando)
  ↓
Delay: 13 dias → Enviar E-mail 5 (último dia)
```

### Cenário 2 — Reengajamento por Inatividade

```
Trigger: Supabase Scheduled (diário às 9h)
  ↓
HTTP GET: Supabase Edge Function /check-stock-alerts (mode: reengagement)
  ↓
[Edge Function identifica empresas sem movimentação há 3+ dias]
  ↓
[Edge Function envia e-mail via Resend diretamente]
```

### Cenário 3 — Trial Convertido (Confirmação de Pagamento)

```
Trigger: Mercado Pago Webhook → payment.approved
  ↓
HTTP PATCH: Supabase REST API → UPDATE companies SET plan='professional', subscription_status='active'
  ↓
Enviar E-mail 6 (pós-assinatura)
```
