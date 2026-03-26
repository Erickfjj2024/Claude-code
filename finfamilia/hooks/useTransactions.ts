import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { TransactionWithCategory } from '../types';

export function useTransactions(limit = 50) {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(name, icon, color)
        `)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setTransactions((data as TransactionWithCategory[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();

    // Realtime subscription
    const channel = supabase
      .channel('transactions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { transactions, loading, error, refetch: fetchTransactions };
}
