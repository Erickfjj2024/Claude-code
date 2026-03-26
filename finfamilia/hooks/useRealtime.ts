import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

type TableName = 'transactions' | 'bills' | 'budgets' | 'investments';

/**
 * Generic realtime subscription hook.
 * Calls onUpdate whenever a change happens in the given table.
 */
export function useRealtime(table: TableName, onUpdate: () => void) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const channel = supabase
      .channel(`realtime_${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        onUpdateRef.current();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);
}
