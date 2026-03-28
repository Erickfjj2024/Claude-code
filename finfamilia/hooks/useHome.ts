import { useEffect, useState } from 'react';
import { startOfMonth, endOfMonth, format, addDays } from 'date-fns';
import { supabase } from '../lib/supabase';

export interface HomeData {
  // Saldo
  totalBalance: number;
  accounts: { id: string; name: string; balance: number; institution: string }[];

  // Transações do mês
  totalIncome: number;
  totalExpenses: number;

  // Orçamento
  budgetCategories: {
    name: string;
    icon: string;
    color: string;
    spent: number;
    limit: number;
  }[];
  budgetTotalSpent: number;
  budgetTotalLimit: number;

  // Contas a pagar
  nextBills: {
    id: string;
    name: string;
    amount: number;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    recurrence: string;
  }[];

  // Investimentos
  totalInvested: number;
  investmentVariation: number;
}

// Mock data usado como fallback quando o banco está vazio
const MOCK_DATA: HomeData = {
  totalBalance: 29_000.5,
  accounts: [
    { id: '1', name: 'PicPay Empresas', balance: 18_420.5, institution: 'PicPay' },
    { id: '2', name: 'Nubank',          balance: 6_380.0,  institution: 'Nubank'  },
    { id: '3', name: 'Poupança',        balance: 4_200.0,  institution: 'Caixa'   },
  ],
  totalIncome: 11_700,
  totalExpenses: 6_650,
  budgetCategories: [
    { name: 'Moradia',     icon: '🏠', color: '#FF6B6B', spent: 3200, limit: 3500 },
    { name: 'Alimentação', icon: '🍔', color: '#FF9F43', spent: 1850, limit: 2000 },
    { name: 'Transporte',  icon: '🚗', color: '#4DA6FF', spent: 680,  limit: 800  },
    { name: 'Lazer',       icon: '🎮', color: '#9B59B6', spent: 920,  limit: 800  },
  ],
  budgetTotalSpent: 6_650,
  budgetTotalLimit: 8_500,
  nextBills: [
    { id: '1', name: 'Aluguel',       amount: 2200,  due_date: '2026-04-01', status: 'pending', recurrence: 'monthly' },
    { id: '2', name: 'Internet',      amount: 129.9, due_date: '2026-04-05', status: 'pending', recurrence: 'monthly' },
    { id: '3', name: 'Fatura Nubank', amount: 1840,  due_date: '2026-04-08', status: 'overdue', recurrence: 'monthly' },
  ],
  totalInvested: 125_400,
  investmentVariation: 2.65,
};

export function useHome() {
  const [data, setData]       = useState<HomeData>(MOCK_DATA);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const now        = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd   = format(endOfMonth(now),   'yyyy-MM-dd');
      const today      = format(now, 'yyyy-MM-dd');
      const in30days   = format(addDays(now, 30),  'yyyy-MM-dd');

      const [accountsRes, txRes, budgetsRes, billsRes, investRes] = await Promise.all([
        supabase.from('accounts').select('id, name, balance, institution').order('name'),
        supabase.from('transactions')
          .select('amount, type')
          .gte('date', monthStart)
          .lte('date', monthEnd),
        supabase.from('budgets')
          .select('spent_amount, limit_amount, category:categories(name,icon,color)')
          .eq('month', monthStart)
          .order('spent_amount', { ascending: false })
          .limit(4),
        supabase.from('bills')
          .select('id, name, amount, due_date, status, recurrence')
          .gte('due_date', today)
          .lte('due_date', in30days)
          .in('status', ['pending', 'overdue'])
          .order('due_date')
          .limit(3),
        supabase.from('investments')
          .select('invested_amount, current_value'),
      ]);

      // Se não houver dados, manter mock
      const hasAccounts     = (accountsRes.data?.length ?? 0) > 0;
      const hasTransactions = (txRes.data?.length ?? 0) > 0;

      if (!hasAccounts && !hasTransactions) {
        setUsingMock(true);
        return;
      }

      setUsingMock(false);

      // Contas
      const accounts = accountsRes.data ?? [];
      const totalBalance = accounts.reduce((s, a) => s + (a.balance ?? 0), 0);

      // Transações
      const txs = txRes.data ?? [];
      const totalIncome   = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const totalExpenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      // Orçamentos
      const budgets = (budgetsRes.data ?? []) as unknown as Array<{
        spent_amount: number;
        limit_amount: number;
        category: { name: string; icon: string; color: string } | null;
      }>;
      const budgetCategories = budgets
        .filter(b => b.category)
        .map(b => ({
          name:  b.category!.name,
          icon:  b.category!.icon,
          color: b.category!.color,
          spent: b.spent_amount,
          limit: b.limit_amount,
        }));
      const budgetTotalSpent = budgetCategories.reduce((s, b) => s + b.spent, 0);
      const budgetTotalLimit = budgetCategories.reduce((s, b) => s + b.limit, 0);

      // Contas a pagar
      const nextBills = (billsRes.data ?? []) as HomeData['nextBills'];

      // Investimentos
      const invs = investRes.data ?? [];
      const totalInvested     = invs.reduce((s, i) => s + (i.invested_amount ?? 0), 0);
      const totalCurrentValue = invs.reduce((s, i) => s + (i.current_value ?? 0), 0);
      const investmentVariation = totalInvested > 0
        ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
        : 0;

      setData({
        totalBalance,
        accounts,
        totalIncome,
        totalExpenses,
        budgetCategories: budgetCategories.length > 0 ? budgetCategories : MOCK_DATA.budgetCategories,
        budgetTotalSpent: budgetTotalSpent || MOCK_DATA.budgetTotalSpent,
        budgetTotalLimit: budgetTotalLimit || MOCK_DATA.budgetTotalLimit,
        nextBills: nextBills.length > 0 ? nextBills : MOCK_DATA.nextBills,
        totalInvested: totalInvested || MOCK_DATA.totalInvested,
        investmentVariation,
      });
    } catch (err) {
      // Em caso de erro, mantém mock silenciosamente
      console.warn('[useHome] Erro ao carregar dados:', err);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, usingMock, refetch: loadAll };
}
