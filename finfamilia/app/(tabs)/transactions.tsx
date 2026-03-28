import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionItem } from '../../components/TransactionItem';
import { Pill } from '../../components/ui/Pill';
import { MoneyText } from '../../components/ui/MoneyText';
import { Colors } from '../../constants/colors';
import { useTransactions } from '../../hooks/useTransactions';
import { fmt } from '../../lib/utils';
import type { TransactionWithCategory } from '../../types';

type Filter = 'todos' | 'receitas' | 'despesas';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todos',    label: 'Todos'    },
  { key: 'receitas', label: 'Receitas' },
  { key: 'despesas', label: 'Despesas' },
];

// ─── Mock data para visualização antes do Supabase ter dados ──────────────────
const MOCK_TRANSACTIONS: TransactionWithCategory[] = [
  {
    id: '1', account_id: '1', date: '2026-03-28', description: 'Supermercado Extra',
    amount: 284.5, type: 'expense', is_recurring: false, created_at: '',
    payment_method: 'pix',
    category: { name: 'Alimentação', icon: '🍔', color: '#FF9F43' },
  },
  {
    id: '2', account_id: '1', date: '2026-03-28', description: 'Salário Março',
    amount: 8500, type: 'income', is_recurring: false, created_at: '',
    payment_method: 'pix',
    category: { name: 'Salário', icon: '💰', color: '#00D4AA' },
  },
  {
    id: '3', account_id: '1', date: '2026-03-27', description: 'Posto Shell',
    amount: 180, type: 'expense', is_recurring: false, created_at: '',
    payment_method: 'card',
    category: { name: 'Transporte', icon: '🚗', color: '#4DA6FF' },
  },
  {
    id: '4', account_id: '1', date: '2026-03-27', description: 'Netflix',
    amount: 55.9, type: 'expense', is_recurring: true, created_at: '',
    payment_method: 'card',
    category: { name: 'Lazer', icon: '🎮', color: '#9B59B6' },
  },
  {
    id: '5', account_id: '1', date: '2026-03-26', description: 'Farmácia São João',
    amount: 97.3, type: 'expense', is_recurring: false, created_at: '',
    payment_method: 'pix',
    category: { name: 'Saúde', icon: '🏥', color: '#FF4D6A' },
  },
  {
    id: '6', account_id: '1', date: '2026-03-25', description: 'Receita PJ — Cliente ABC',
    amount: 3200, type: 'income', is_recurring: false, created_at: '',
    payment_method: 'pix',
    category: { name: 'Receita PJ', icon: '💼', color: '#00D4AA' },
  },
  {
    id: '7', account_id: '1', date: '2026-03-24', description: 'Academia Smart Fit',
    amount: 99.9, type: 'expense', is_recurring: true, created_at: '',
    payment_method: 'card',
    category: { name: 'Saúde', icon: '🏥', color: '#FF4D6A' },
  },
  {
    id: '8', account_id: '1', date: '2026-03-23', description: 'Aluguel',
    amount: 2200, type: 'expense', is_recurring: true, created_at: '',
    payment_method: 'pix',
    category: { name: 'Moradia', icon: '🏠', color: '#FF6B6B' },
  },
];

export default function TransactionsScreen() {
  const [filter, setFilter] = useState<Filter>('todos');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { transactions: dbTransactions, loading, refetch } = useTransactions(100);

  // Use DB data if available, otherwise mock
  const allTransactions = dbTransactions.length > 0 ? dbTransactions : MOCK_TRANSACTIONS;

  const filtered = useMemo(() => {
    let list = allTransactions;

    if (filter === 'receitas') list = list.filter((t) => t.type === 'income');
    if (filter === 'despesas') list = list.filter((t) => t.type === 'expense');

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category?.name.toLowerCase().includes(q),
      );
    }

    return list;
  }, [allTransactions, filter, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, TransactionWithCategory[]>();
    for (const t of filtered) {
      const existing = map.get(t.date) ?? [];
      existing.push(t);
      map.set(t.date, existing);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [filtered]);

  // Summary
  const totalIncome   = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  function formatGroupDate(dateStr: string) {
    const d = parseISO(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (dateStr === format(today, 'yyyy-MM-dd')) return 'Hoje';
    if (dateStr === format(yesterday, 'yyyy-MM-dd')) return 'Ontem';
    return format(d, "EEE, dd 'de' MMM", { locale: ptBR });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transações</Text>
        {loading && <ActivityIndicator size="small" color={Colors.accent} />}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar transação..."
          placeholderTextColor={Colors.textDim}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pills}
      >
        {FILTERS.map((f) => (
          <Pill
            key={f.key}
            label={f.label}
            active={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </ScrollView>

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Receitas</Text>
          <Text style={[styles.summaryValue, { color: Colors.accent }]}>
            +{fmt(totalIncome)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Despesas</Text>
          <Text style={[styles.summaryValue, { color: Colors.red }]}>
            -{fmt(totalExpenses)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Saldo</Text>
          <MoneyText
            value={totalIncome - totalExpenses}
            colorize
            size={13}
            style={{ fontFamily: 'JetBrainsMono_700Bold' }}
          />
        </View>
      </View>

      {/* List */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        {grouped.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💸</Text>
            <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
          </View>
        ) : (
          grouped.map(([date, items]) => (
            <View key={date} style={styles.group}>
              {/* Date header */}
              <View style={styles.dateHeader}>
                <Text style={styles.dateLabel}>{formatGroupDate(date)}</Text>
                <Text style={styles.dateSub}>
                  {items.length} {items.length === 1 ? 'transação' : 'transações'}
                </Text>
              </View>

              {/* Cards */}
              <View style={styles.groupCard}>
                {items.map((t, idx) => (
                  <View key={t.id}>
                    <TransactionItem transaction={t} />
                    {idx < items.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 24,
    color: Colors.text,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: { fontSize: 15 },
  searchInput: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.text,
    paddingVertical: 11,
  },
  clearBtn: {
    fontSize: 14,
    color: Colors.textDim,
    padding: 4,
  },

  // Pills
  pills: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 0,
  },

  // Summary
  summaryBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  summaryLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textSec,
  },
  summaryValue: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 13,
  },

  // List
  list: { flex: 1 },
  group: { marginBottom: 8 },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginBottom: 6,
    gap: 8,
  },
  dateLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: Colors.text,
  },
  dateSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textDim,
  },
  groupCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.textSec,
  },
});
