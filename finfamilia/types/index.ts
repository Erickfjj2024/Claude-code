// ─── Auth & Profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export type AccountType = 'checking' | 'savings' | 'investment';

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: AccountType;
  balance: number;
  pluggy_account_id?: string;
  last_sync_at?: string;
  created_at: string;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense' | 'transfer';
export type PaymentMethod = 'pix' | 'boleto' | 'card' | 'cash';

export interface Transaction {
  id: string;
  account_id: string;
  date: string;
  description: string;
  amount: number;
  category_id?: string;
  type: TransactionType;
  payment_method?: PaymentMethod;
  tags?: string[];
  notes?: string;
  receipt_url?: string;
  pluggy_transaction_id?: string;
  is_recurring: boolean;
  created_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category?: {
    name: string;
    icon: string;
    color: string;
  };
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  parent_id?: string;
  budget_default?: number;
  sort_order?: number;
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

export interface Budget {
  id: string;
  category_id: string;
  month: string;
  limit_amount: number;
  spent_amount: number;
  rollover_amount?: number;
  created_at: string;
}

// ─── Savings Goals ────────────────────────────────────────────────────────────

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  icon?: string;
  color?: string;
  is_completed: boolean;
  created_at: string;
}

// ─── Bills ────────────────────────────────────────────────────────────────────

export type BillStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type BillRecurrence = 'monthly' | 'weekly' | 'yearly' | 'once';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  category_id?: string;
  status: BillStatus;
  recurrence: BillRecurrence;
  recurrence_end_date?: string;
  barcode?: string;
  pix_key?: string;
  paid_at?: string;
  paid_amount?: number;
  reminder_days?: number[];
  created_at: string;
}

// ─── Credit Cards ─────────────────────────────────────────────────────────────

export interface CreditCard {
  id: string;
  name: string;
  last_digits: string;
  brand: string;
  credit_limit: number;
  available_limit: number;
  closing_day: number;
  due_day: number;
  pluggy_card_id?: string;
  created_at: string;
}

// ─── Investments ──────────────────────────────────────────────────────────────

export type InvestmentType =
  | 'cdb'
  | 'lci'
  | 'lca'
  | 'tesouro'
  | 'acao'
  | 'fii'
  | 'etf'
  | 'cripto'
  | 'poupanca'
  | 'previdencia';

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  institution: string;
  ticker?: string;
  invested_amount: number;
  current_value: number;
  rate?: number;
  purchase_date: string;
  maturity_date?: string;
  created_at: string;
}

// ─── Investor Profile ─────────────────────────────────────────────────────────

export type RiskTolerance = 'conservador' | 'moderado' | 'arrojado' | 'agressivo';

export interface InvestorProfile {
  id: string;
  risk_tolerance: RiskTolerance;
  investment_horizon: number;
  knowledge_level: string;
  liquidity_need: string;
  monthly_income: number;
  monthly_investment_capacity: number;
  has_emergency_fund: boolean;
  emergency_fund_months: number;
  has_debts: boolean;
  debt_total: number;
  questionnaire_answers?: Record<string, unknown>;
  created_at: string;
}

// ─── Financial Objectives ─────────────────────────────────────────────────────

export type ObjectiveType =
  | 'property'
  | 'vehicle'
  | 'education'
  | 'travel'
  | 'retirement'
  | 'business'
  | 'emergency_fund'
  | 'custom';

export type ObjectiveStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface FinancialObjective {
  id: string;
  name: string;
  type: ObjectiveType;
  target_amount: number;
  target_amount_adjusted?: number;
  current_amount: number;
  monthly_contribution?: number;
  required_contribution?: number;
  deadline?: string;
  priority?: number;
  status: ObjectiveStatus;
  expected_return_rate?: number;
  inflation_rate?: number;
  scenario_optimistic?: Record<string, unknown>;
  scenario_realistic?: Record<string, unknown>;
  scenario_pessimistic?: Record<string, unknown>;
  icon?: string;
  color?: string;
  created_at: string;
}

// ─── Market ───────────────────────────────────────────────────────────────────

export interface MarketIndicator {
  id: string;
  indicator_code: string;
  indicator_name: string;
  value: number;
  previous_value?: number;
  variation_pct?: number;
  reference_date: string;
  source: string;
  fetched_at: string;
}

// ─── Financial Health ─────────────────────────────────────────────────────────

export interface FinancialHealthScore {
  id: string;
  month: string;
  overall_score: number;
  emergency_fund_score: number;
  debt_ratio_score: number;
  diversification_score: number;
  budget_adherence_score: number;
  objective_progress_score: number;
  savings_rate_score: number;
  total_income: number;
  total_expenses: number;
  total_savings: number;
  savings_rate: number;
  debt_to_income_ratio: number;
  insights?: Record<string, unknown>;
  created_at: string;
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export interface AIConversation {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  context_snapshot?: Record<string, unknown>;
  model_used?: string;
  tokens_input?: number;
  tokens_output?: number;
  cost_estimate?: number;
  created_at: string;
}

export interface AIAssetAnalysis {
  id: string;
  asset_ticker: string;
  asset_type: string;
  asset_name: string;
  analysis_past: string;
  analysis_present: string;
  analysis_future: string;
  analysis_verdict: string;
  metrics?: Record<string, unknown>;
  scenarios?: Record<string, unknown>;
  risks?: Record<string, unknown>;
  market_snapshot?: Record<string, unknown>;
  portfolio_context?: Record<string, unknown>;
  model_used?: string;
  tokens_total?: number;
  cost_estimate?: number;
  is_favorite: boolean;
  expires_at?: string;
  created_at: string;
}

// ─── Investment Suggestions ───────────────────────────────────────────────────

export interface InvestmentSuggestion {
  id: string;
  type: 'allocation' | 'opportunity' | 'rebalance' | 'alert';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  related_objective_id?: string;
  related_indicator?: string;
  action_type?: 'buy' | 'sell' | 'rebalance' | 'info';
  suggested_product?: string;
  suggested_amount?: number;
  is_read: boolean;
  is_dismissed: boolean;
  expires_at?: string;
  created_at: string;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export interface AllocationSegment {
  label: string;
  value: number;
  color: string;
}
