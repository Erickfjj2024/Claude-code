import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { MarketIndicator } from '../types';

export function useMarket() {
  const [indicators, setIndicators] = useState<MarketIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchIndicators() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('market_indicators')
        .select('*')
        .order('fetched_at', { ascending: false });

      if (error) throw error;
      setIndicators((data as MarketIndicator[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar mercado');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIndicators();
  }, []);

  return { indicators, loading, error, refetch: fetchIndicators };
}
