-- ============================================================
-- FinFamília — Schema Completo v1.0
-- Execute no Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- busca fuzzy em descrições

-- ============================================================
-- 1. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📦',
  color TEXT NOT NULL DEFAULT '#8899AA',
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  budget_default DECIMAL(15,2),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================================
-- 2. ACCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  institution TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('checking','savings','investment')),
  balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  pluggy_account_id TEXT,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accounts_all" ON accounts USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. CATEGORIZATION_RULES
-- ============================================================
CREATE TABLE IF NOT EXISTS categorization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  pattern TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  priority INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE categorization_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cat_rules_all" ON categorization_rules USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL DEFAULT '',
  amount DECIMAL(15,2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income','expense','transfer')),
  payment_method TEXT CHECK (payment_method IN ('pix','boleto','card','cash')),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  receipt_url TEXT,
  pluggy_transaction_id TEXT UNIQUE,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS transactions_user_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_category_idx ON transactions(category_id);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_all" ON transactions USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. BUDGETS
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- primeiro dia do mês: 2026-03-01
  limit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  spent_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  rollover_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category_id, month)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "budgets_all" ON budgets USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 6. SAVINGS_GOALS
-- ============================================================
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  deadline DATE,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#00D4AA',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "savings_goals_all" ON savings_goals USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 7. GOAL_CONTRIBUTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS goal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goal_contributions_all" ON goal_contributions USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 8. BILLS
-- ============================================================
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','cancelled')),
  recurrence TEXT NOT NULL DEFAULT 'monthly' CHECK (recurrence IN ('monthly','weekly','yearly','once')),
  recurrence_end_date DATE,
  barcode TEXT,
  pix_key TEXT,
  paid_at TIMESTAMPTZ,
  paid_amount DECIMAL(15,2),
  reminder_days INT[] DEFAULT '{3,1}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bills_due_date_idx ON bills(due_date ASC);
CREATE INDEX IF NOT EXISTS bills_status_idx ON bills(status);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bills_all" ON bills USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 9. RECEIVABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS receivables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  expected_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','received','overdue')),
  source TEXT,
  linked_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "receivables_all" ON receivables USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 10. CREDIT_CARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  last_digits TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'VISA',
  credit_limit DECIMAL(15,2) NOT NULL DEFAULT 0,
  available_limit DECIMAL(15,2) NOT NULL DEFAULT 0,
  closing_day INT NOT NULL DEFAULT 1 CHECK (closing_day BETWEEN 1 AND 31),
  due_day INT NOT NULL DEFAULT 10 CHECK (due_day BETWEEN 1 AND 31),
  pluggy_card_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credit_cards_all" ON credit_cards USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 11. CARD_TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  card_id UUID NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL DEFAULT '',
  amount DECIMAL(15,2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  installment_number INT DEFAULT 1,
  total_installments INT DEFAULT 1,
  invoice_month DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE card_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "card_transactions_all" ON card_transactions USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 12. INVESTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cdb','lci','lca','tesouro','acao','fii','etf','cripto','poupanca','previdencia')),
  institution TEXT NOT NULL DEFAULT '',
  ticker TEXT,
  invested_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  rate DECIMAL(8,4),
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  maturity_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investments_all" ON investments USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 13. INVESTMENT_HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS investment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(investment_id, date)
);

ALTER TABLE investment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investment_history_all" ON investment_history USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 14. INVESTOR_PROFILE
-- ============================================================
CREATE TABLE IF NOT EXISTS investor_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() UNIQUE,
  risk_tolerance TEXT NOT NULL DEFAULT 'moderado' CHECK (risk_tolerance IN ('conservador','moderado','arrojado','agressivo')),
  investment_horizon INT NOT NULL DEFAULT 5, -- anos
  knowledge_level TEXT NOT NULL DEFAULT 'intermediario',
  liquidity_need TEXT NOT NULL DEFAULT 'media',
  monthly_income DECIMAL(15,2) NOT NULL DEFAULT 0,
  monthly_investment_capacity DECIMAL(15,2) NOT NULL DEFAULT 0,
  has_emergency_fund BOOLEAN DEFAULT false,
  emergency_fund_months INT DEFAULT 0,
  has_debts BOOLEAN DEFAULT false,
  debt_total DECIMAL(15,2) DEFAULT 0,
  questionnaire_answers JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE investor_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investor_profile_all" ON investor_profile USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 15. FINANCIAL_OBJECTIVES
-- ============================================================
CREATE TABLE IF NOT EXISTS financial_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom' CHECK (type IN ('property','vehicle','education','travel','retirement','business','emergency_fund','custom')),
  target_amount DECIMAL(15,2) NOT NULL,
  target_amount_adjusted DECIMAL(15,2),
  current_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  monthly_contribution DECIMAL(15,2),
  required_contribution DECIMAL(15,2),
  deadline DATE,
  priority INT DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed','cancelled')),
  expected_return_rate DECIMAL(5,2) DEFAULT 8.0,
  inflation_rate DECIMAL(5,2) DEFAULT 4.5,
  scenario_optimistic JSONB DEFAULT '{}',
  scenario_realistic JSONB DEFAULT '{}',
  scenario_pessimistic JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  suggested_allocation JSONB DEFAULT '{}',
  suggested_products TEXT[] DEFAULT '{}',
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#00D4AA',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE financial_objectives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "financial_objectives_all" ON financial_objectives USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 16. OBJECTIVE_CONTRIBUTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS objective_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  objective_id UUID NOT NULL REFERENCES financial_objectives(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual','automatic','surplus')),
  investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE objective_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "objective_contributions_all" ON objective_contributions USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 17. FINANCIAL_HEALTH_SCORES
-- ============================================================
CREATE TABLE IF NOT EXISTS financial_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  month DATE NOT NULL,
  overall_score INT NOT NULL DEFAULT 0 CHECK (overall_score BETWEEN 0 AND 100),
  emergency_fund_score INT DEFAULT 0,
  debt_ratio_score INT DEFAULT 0,
  diversification_score INT DEFAULT 0,
  budget_adherence_score INT DEFAULT 0,
  objective_progress_score INT DEFAULT 0,
  savings_rate_score INT DEFAULT 0,
  total_income DECIMAL(15,2) DEFAULT 0,
  total_expenses DECIMAL(15,2) DEFAULT 0,
  total_savings DECIMAL(15,2) DEFAULT 0,
  savings_rate DECIMAL(5,2) DEFAULT 0,
  debt_to_income_ratio DECIMAL(5,2) DEFAULT 0,
  insights JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE financial_health_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "health_scores_all" ON financial_health_scores USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 18. SAVED_SIMULATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('compound_interest','retirement','financing','rent_vs_buy','tax')),
  parameters JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE saved_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_simulations_all" ON saved_simulations USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 19. MARKET_INDICATORS
-- ============================================================
CREATE TABLE IF NOT EXISTS market_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_code TEXT NOT NULL,
  indicator_name TEXT NOT NULL,
  value DECIMAL(15,4) NOT NULL,
  previous_value DECIMAL(15,4),
  variation_pct DECIMAL(8,4),
  reference_date DATE NOT NULL,
  source TEXT NOT NULL DEFAULT 'bcb',
  fetched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(indicator_code, reference_date)
);

ALTER TABLE market_indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "market_indicators_select" ON market_indicators FOR SELECT USING (true);
CREATE POLICY "market_indicators_insert" ON market_indicators FOR INSERT WITH CHECK (true);
CREATE POLICY "market_indicators_update" ON market_indicators FOR UPDATE USING (true);

-- ============================================================
-- 20. MARKET_INDICATOR_HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS market_indicator_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_code TEXT NOT NULL,
  value DECIMAL(15,4) NOT NULL,
  reference_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(indicator_code, reference_date)
);

ALTER TABLE market_indicator_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "market_history_select" ON market_indicator_history FOR SELECT USING (true);
CREATE POLICY "market_history_insert" ON market_indicator_history FOR INSERT WITH CHECK (true);

-- ============================================================
-- 21. MARKET_ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS market_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  indicator_code TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('above','below','change_pct')),
  threshold DECIMAL(15,4) NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE market_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "market_alerts_all" ON market_alerts USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 22. ECONOMIC_CALENDAR
-- ============================================================
CREATE TABLE IF NOT EXISTS economic_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'custom' CHECK (event_type IN ('copom','ipca','pib','employment','custom')),
  description TEXT,
  expected_impact TEXT DEFAULT 'neutral' CHECK (expected_impact IN ('positive','negative','neutral','uncertain')),
  actual_result TEXT,
  is_recurring BOOLEAN DEFAULT false,
  notify BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE economic_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "economic_calendar_select" ON economic_calendar FOR SELECT USING (true);
CREATE POLICY "economic_calendar_insert" ON economic_calendar FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 23. INVESTMENT_SUGGESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS investment_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  type TEXT NOT NULL CHECK (type IN ('allocation','opportunity','rebalance','alert')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  related_objective_id UUID REFERENCES financial_objectives(id) ON DELETE SET NULL,
  related_indicator TEXT,
  action_type TEXT CHECK (action_type IN ('buy','sell','rebalance','info')),
  suggested_product TEXT,
  suggested_amount DECIMAL(15,2),
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE investment_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investment_suggestions_all" ON investment_suggestions USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 24. AI_CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  title TEXT NOT NULL DEFAULT 'Nova conversa',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_conversations_all" ON ai_conversations USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 25. AI_MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  context_snapshot JSONB DEFAULT '{}',
  model_used TEXT,
  tokens_input INT,
  tokens_output INT,
  cost_estimate DECIMAL(8,4),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_messages_conv_idx ON ai_messages(conversation_id, created_at ASC);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_messages_all" ON ai_messages USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 26. AI_ASSET_ANALYSES
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_asset_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  asset_ticker TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'stock',
  asset_name TEXT NOT NULL DEFAULT '',
  analysis_past TEXT NOT NULL DEFAULT '',
  analysis_present TEXT NOT NULL DEFAULT '',
  analysis_future TEXT NOT NULL DEFAULT '',
  analysis_verdict TEXT NOT NULL DEFAULT '',
  metrics JSONB DEFAULT '{}',
  scenarios JSONB DEFAULT '{}',
  risks JSONB DEFAULT '{}',
  market_snapshot JSONB DEFAULT '{}',
  portfolio_context JSONB DEFAULT '{}',
  model_used TEXT,
  tokens_total INT,
  cost_estimate DECIMAL(8,4),
  is_favorite BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_asset_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_asset_analyses_all" ON ai_asset_analyses USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 27. AI_MONTHLY_REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  month DATE NOT NULL,
  report_content TEXT NOT NULL DEFAULT '',
  highlights JSONB DEFAULT '{}',
  suggestions JSONB DEFAULT '{}',
  next_month_projection JSONB DEFAULT '{}',
  model_used TEXT,
  tokens_total INT,
  cost_estimate DECIMAL(8,4),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE ai_monthly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_monthly_reports_all" ON ai_monthly_reports USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 28. AI_SMART_ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_smart_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('opportunity','risk','behavioral','market_event')),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('high','medium','low')),
  related_asset TEXT,
  related_objective_id UUID REFERENCES financial_objectives(id) ON DELETE SET NULL,
  trigger_data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_actioned BOOLEAN DEFAULT false,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_smart_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_smart_alerts_all" ON ai_smart_alerts USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 29. AI_COMPARISONS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  title TEXT NOT NULL,
  assets_compared TEXT[] NOT NULL DEFAULT '{}',
  comparison_content TEXT NOT NULL DEFAULT '',
  comparison_table JSONB DEFAULT '{}',
  verdict TEXT NOT NULL DEFAULT '',
  model_used TEXT,
  cost_estimate DECIMAL(8,4),
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_comparisons_all" ON ai_comparisons USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 30. AI_USAGE_LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  feature TEXT NOT NULL CHECK (feature IN ('chat','analysis','report','alert','comparison')),
  tokens_input INT NOT NULL DEFAULT 0,
  tokens_output INT NOT NULL DEFAULT 0,
  cost_usd DECIMAL(8,6) NOT NULL DEFAULT 0,
  model TEXT NOT NULL DEFAULT 'claude-sonnet-4-20250514',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_usage_log_all" ON ai_usage_log USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SEED — CATEGORIAS
-- ============================================================
INSERT INTO categories (name, icon, color, type, sort_order) VALUES
  -- Despesas
  ('Moradia',       '🏠', '#FF6B6B', 'expense', 1),
  ('Alimentação',   '🍔', '#FF9F43', 'expense', 2),
  ('Transporte',    '🚗', '#4DA6FF', 'expense', 3),
  ('Saúde',         '🏥', '#FF4D6A', 'expense', 4),
  ('Educação',      '📚', '#A855F7', 'expense', 5),
  ('Filhos',        '👶', '#FF6B9D', 'expense', 6),
  ('Contas fixas',  '💡', '#FFD93D', 'expense', 7),
  ('Lazer',         '🎮', '#9B59B6', 'expense', 8),
  ('Empresa',       '👔', '#2ECC71', 'expense', 9),
  ('Financeiro',    '💳', '#E74C3C', 'expense', 10),
  ('Outros',        '🔧', '#8899AA', 'expense', 11),
  -- Receitas
  ('Salário',       '💰', '#00D4AA', 'income',  1),
  ('Receita PJ',    '💼', '#00D4AA', 'income',  2),
  ('Rendimentos',   '📈', '#4DA6FF', 'income',  3),
  ('Outros',        '🎁', '#8899AA', 'income',  4)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED — CALENDÁRIO ECONÔMICO 2026
-- ============================================================
INSERT INTO economic_calendar (event_name, event_date, event_type, description, expected_impact, is_recurring, notify) VALUES
  ('COPOM — Reunião',      '2026-01-28', 'copom',      'Decisão sobre taxa Selic',          'uncertain', true,  true),
  ('IPCA — Janeiro/2026',  '2026-02-12', 'ipca',       'Índice de Preços ao Consumidor',    'uncertain', true,  true),
  ('COPOM — Reunião',      '2026-03-18', 'copom',      'Decisão sobre taxa Selic',          'uncertain', true,  true),
  ('IPCA — Março/2026',    '2026-04-09', 'ipca',       'Índice de Preços ao Consumidor',    'uncertain', true,  true),
  ('COPOM — Reunião',      '2026-05-06', 'copom',      'Decisão sobre taxa Selic',          'uncertain', true,  true),
  ('IPCA — Maio/2026',     '2026-06-11', 'ipca',       'Índice de Preços ao Consumidor',    'uncertain', true,  true),
  ('COPOM — Reunião',      '2026-06-17', 'copom',      'Decisão sobre taxa Selic',          'uncertain', true,  true),
  ('PIB — 1T2026',         '2026-05-28', 'pib',        'PIB do primeiro trimestre',         'uncertain', true,  true),
  ('PIB — 2T2026',         '2026-08-27', 'pib',        'PIB do segundo trimestre',          'uncertain', true,  true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- REALTIME — habilitar nas tabelas principais
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE bills;
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE investments;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_smart_alerts;

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
SELECT 'FinFamília schema criado com sucesso! 🎉' AS status;
