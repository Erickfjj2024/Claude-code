import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Budget } from '../types';

export function useBudget(month?: string) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetMonth = month ?? new Date().toISOString().slice(0, 7) + '-01';

  async function fetchBudgets() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('month', targetMonth);

      if (error) throw error;
      setBudgets((data as Budget[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar orçamentos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBudgets();

    const channel = supabase
      .channel('budgets_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets' }, () => {
        fetchBudgets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetMonth]);

  return { budgets, loading, error, refetch: fetchBudgets };
}
