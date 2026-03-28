import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AllocationBar } from '../../components/charts/AllocationBar';
import { MiniLineChart } from '../../components/charts/MiniLineChart';
import { BillItem } from '../../components/BillItem';
import { Card } from '../../components/ui/Card';
import { IconBox } from '../../components/ui/IconBox';
import { MoneyText } from '../../components/ui/MoneyText';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Colors } from '../../constants/colors';
import { fmt, fmtVariation, greeting, pct } from '../../lib/utils';
import { useHome } from '../../hooks/useHome';
import type { Bill } from '../../types';

const BALANCE_HISTORY = [26000, 27500, 26800, 28100, 29000, 29001];

const MOCK_ALLOCATION = [
  { label: 'RF',     value: 45, color: Colors.accent  },
  { label: 'FII',    value: 20, color: Colors.blue    },
  { label: 'Ações',  value: 20, color: Colors.purple  },
  { label: 'ETF',    value: 10, color: Colors.orange  },
  { label: 'Cripto', value: 5,  color: Colors.yellow  },
];

const AI_LAST_TIP =
  'Com Selic a 13,75%, títulos pós-fixados (CDB 110% CDI) seguem atrativos para reserva de emergência. Sua alocação em renda fixa de 45% está adequada ao perfil moderado.';

function accountIcon(institution: string): string {
  const i = institution.toLowerCase();
  if (i.includes('picpay')) return '🏦';
  if (i.includes('nubank')) return '💜';
  if (i.includes('inter'))  return '🟠';
  if (i.includes('caixa'))  return '🏧';
  if (i.includes('bradesco')) return '🔴';
  if (i.includes('itaú'))   return '🟡';
  return '🏦';
}

export default function HomeScreen() {
  const router = useRouter();
  const { data, loading, usingMock, refetch } = useHome();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={Colors.accent}
          />
        }
      >
        {/* ── 1. HEADER ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.appName}>FinFamília 👨‍👩‍👧</Text>
          </View>
          <View style={styles.headerRight}>
            {loading && <ActivityIndicator size="small" color={Colors.accent} />}
            {usingMock && !loading && (
              <View style={styles.mockBadge}>
                <Text style={styles.mockBadgeText}>Demo</Text>
              </View>
            )}
            <Pressable style={styles.settingsBtn}>
              <Text style={{ fontSize: 20 }}>⚙️</Text>
            </Pressable>
            <View style={styles.avatars}>
              <View style={[styles.avatar, styles.avatar1]}>
                <Text style={styles.avatarText}>EU</Text>
              </View>
              <View style={[styles.avatar, styles.avatar2]}>
                <Text style={styles.avatarText}>EL</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 2. SALDO TOTAL ── */}
        <BalanceCard
          total={data.totalBalance}
          accounts={data.accounts}
          income={data.totalIncome}
          expenses={data.totalExpenses}
        />

        {/* ── 3. ORÇAMENTO DO MÊS ── */}
        <BudgetCard
          categories={data.budgetCategories}
          totalSpent={data.budgetTotalSpent}
          totalLimit={data.budgetTotalLimit}
        />

        {/* ── 4. PRÓXIMAS CONTAS ── */}
        <BillsCard bills={data.nextBills} router={router} />

        {/* ── 5. INVESTIMENTOS ── */}
        <InvestmentsCard
          total={data.totalInvested}
          variation={data.investmentVariation}
          router={router}
        />

        {/* ── 6. CARD IA ── */}
        <AICard router={router} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BalanceCard({ total, accounts, income, expenses }: {
  total: number;
  accounts: { id: string; name: string; balance: number; institution: string }[];
  income: number;
  expenses: number;
}) {
  const variation = income > 0 ? ((income - expenses) / income) * 100 : 0;

  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceGlow} />
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>Saldo total</Text>
        <View style={styles.variationBadge}>
          <Text style={styles.variationText}>
            {income > 0 ? fmtVariation(variation) : '—'} mês
          </Text>
        </View>
      </View>
      <MoneyText value={total} size={34} style={styles.balanceValue} />
      <MiniLineChart
        data={BALANCE_HISTORY}
        color={Colors.accent}
        width={200}
        height={40}
        showGradient
        style={{ marginVertical: 12, alignSelf: 'center' }}
      />
      <View style={styles.accountsRow}>
        {accounts.slice(0, 3).map((acc) => (
          <View key={acc.id} style={styles.accountMini}>
            <Text style={styles.accountIcon}>{accountIcon(acc.institution)}</Text>
            <Text style={styles.accountName} numberOfLines={1}>{acc.name}</Text>
            <Text style={styles.accountBalance}>{fmt(acc.balance)}</Text>
          </View>
        ))}
      </View>
      {/* Resumo mês */}
      {income > 0 && (
        <View style={styles.monthSummary}>
          <View style={styles.monthItem}>
            <Text style={styles.monthLabel}>Receitas</Text>
            <Text style={[styles.monthValue, { color: Colors.accent }]}>+{fmt(income)}</Text>
          </View>
          <View style={styles.monthDivider} />
          <View style={styles.monthItem}>
            <Text style={styles.monthLabel}>Despesas</Text>
            <Text style={[styles.monthValue, { color: Colors.red }]}>-{fmt(expenses)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function BudgetCard({ categories, totalSpent, totalLimit }: {
  categories: { name: string; icon: string; color: string; spent: number; limit: number }[];
  totalSpent: number;
  totalLimit: number;
}) {
  const totalPct = pct(totalSpent, totalLimit);
  const now = new Date();
  const monthName = now.toLocaleString('pt-BR', { month: 'long' });

  return (
    <Card style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          💰 Orçamento — {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </Text>
        <Text style={styles.sectionLink}>Ver tudo →</Text>
      </View>
      <View style={styles.budgetSummary}>
        <View style={styles.budgetSummaryRow}>
          <Text style={styles.budgetSpent}>{fmt(totalSpent)}</Text>
          <Text style={styles.budgetLimit}>de {fmt(totalLimit)}</Text>
          <Text style={[
            styles.budgetPct,
            { color: totalPct >= 100 ? Colors.red : totalPct >= 80 ? Colors.orange : Colors.accent },
          ]}>
            {totalPct.toFixed(0)}%
          </Text>
        </View>
        <ProgressBar value={totalSpent} max={totalLimit} autoColor height={8} />
      </View>
      <View style={styles.budgetGrid}>
        {categories.slice(0, 4).map((cat) => {
          const p = pct(cat.spent, cat.limit);
          return (
            <View key={cat.name} style={styles.budgetGridItem}>
              <View style={styles.budgetItemHeader}>
                <IconBox icon={cat.icon} color={cat.color} size={32} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.budgetItemName}>{cat.name}</Text>
                  <Text style={styles.budgetItemValues}>
                    {fmt(cat.spent)}
                    <Text style={styles.budgetItemLimit}> / {fmt(cat.limit)}</Text>
                  </Text>
                </View>
                <Text style={[
                  styles.budgetItemPct,
                  { color: p >= 100 ? Colors.red : p >= 80 ? Colors.orange : Colors.textSec },
                ]}>
                  {p.toFixed(0)}%
                </Text>
              </View>
              <ProgressBar value={cat.spent} max={cat.limit} color={cat.color} autoColor height={4} style={{ marginTop: 6 }} />
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function BillsCard({ bills, router }: {
  bills: HomeData['nextBills'];
  router: ReturnType<typeof useRouter>;
}) {
  // Adaptar para o tipo Bill esperado pelo BillItem
  const billItems: Bill[] = bills.map(b => ({
    id: b.id,
    name: b.name,
    amount: b.amount,
    due_date: b.due_date,
    status: b.status,
    recurrence: b.recurrence as Bill['recurrence'],
    created_at: '',
  }));

  return (
    <Card style={styles.section} padding={0}>
      <View style={[styles.sectionHeader, { paddingHorizontal: 16, paddingTop: 16 }]}>
        <Text style={styles.sectionTitle}>📋 Próximas contas</Text>
        <Pressable onPress={() => router.push('/bills')}>
          <Text style={styles.sectionLink}>Ver todas →</Text>
        </Pressable>
      </View>
      {billItems.map((bill, idx) => (
        <View key={bill.id}>
          <BillItem bill={bill} onPress={() => router.push('/bills')} />
          {idx < billItems.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
      <View style={{ height: 8 }} />
    </Card>
  );
}

// Importar o tipo do hook
import type { HomeData } from '../../hooks/useHome';

function InvestmentsCard({ total, variation, router }: {
  total: number;
  variation: number;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <Card style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📈 Investimentos</Text>
        <Pressable onPress={() => router.push('/investments')}>
          <Text style={styles.sectionLink}>Ver carteira →</Text>
        </Pressable>
      </View>
      <View style={styles.investRow}>
        <View>
          <Text style={styles.investLabel}>Total investido</Text>
          <MoneyText value={total} size={22} style={{ marginTop: 2 }} />
        </View>
        {variation !== 0 && (
          <View style={[
            styles.investVarBadge,
            variation < 0 && { backgroundColor: Colors.redDim, borderColor: Colors.red + '40' },
          ]}>
            <Text style={[styles.investVarText, variation < 0 && { color: Colors.red }]}>
              {fmtVariation(variation)} mês
            </Text>
          </View>
        )}
      </View>
      <AllocationBar segments={MOCK_ALLOCATION} height={10} showLegend style={{ marginTop: 14 }} />
    </Card>
  );
}

function AICard({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <Pressable
      onPress={() => router.push('/ai-chat')}
      style={({ pressed }) => [styles.aiCard, pressed && { opacity: 0.88 }]}
    >
      <View style={styles.aiGradient} />
      <View style={styles.aiHeader}>
        <View style={styles.aiIconWrap}>
          <Text style={{ fontSize: 26 }}>🤖</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.aiTitle}>Consultor IA</Text>
          <View style={styles.aiOnlineRow}>
            <View style={styles.aiOnlineDot} />
            <Text style={styles.aiOnlineText}>Online agora</Text>
          </View>
        </View>
        <Text style={styles.aiChevron}>›</Text>
      </View>
      <View style={styles.aiTipBox}>
        <Text style={styles.aiTipLabel}>Última sugestão</Text>
        <Text style={styles.aiTipText} numberOfLines={3}>{AI_LAST_TIP}</Text>
      </View>
      <View style={styles.aiCTA}>
        <Text style={styles.aiCTAText}>Conversar com a IA →</Text>
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 16 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  greeting: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSec },
  appName:  { fontFamily: 'DMSans_700Bold', fontSize: 22, color: Colors.text, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingsBtn: { padding: 4 },
  mockBadge: { backgroundColor: Colors.orangeDim, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.orange + '44' },
  mockBadgeText: { fontFamily: 'DMSans_600SemiBold', fontSize: 10, color: Colors.orange },
  avatars:  { flexDirection: 'row' },
  avatar:   { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.bg },
  avatar1:  { backgroundColor: Colors.accent, zIndex: 2 },
  avatar2:  { backgroundColor: Colors.blue, marginLeft: -10, zIndex: 1 },
  avatarText: { fontFamily: 'DMSans_700Bold', fontSize: 10, color: Colors.bg },

  // Balance card
  balanceCard: { backgroundColor: Colors.card, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, padding: 20, overflow: 'hidden', position: 'relative' },
  balanceGlow: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: Colors.accentGlow, opacity: 0.25 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLabel: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSec },
  variationBadge: { backgroundColor: Colors.accentDim, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.accent + '40' },
  variationText:  { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: Colors.accent },
  balanceValue:   { marginTop: 6 },
  accountsRow:    { flexDirection: 'row', gap: 8 },
  accountMini:    { flex: 1, backgroundColor: Colors.cardHover, borderRadius: 12, padding: 10, gap: 3, borderWidth: 1, borderColor: Colors.border },
  accountIcon:    { fontSize: 16 },
  accountName:    { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.textSec },
  accountBalance: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 11, color: Colors.text },
  monthSummary:   { flexDirection: 'row', marginTop: 12, backgroundColor: Colors.cardHover, borderRadius: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border },
  monthItem:      { flex: 1, alignItems: 'center' },
  monthDivider:   { width: 1, backgroundColor: Colors.border },
  monthLabel:     { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textSec },
  monthValue:     { fontFamily: 'JetBrainsMono_700Bold', fontSize: 13, marginTop: 2 },

  // Sections
  section: {},
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:  { fontFamily: 'DMSans_700Bold', fontSize: 15, color: Colors.text },
  sectionLink:   { fontFamily: 'DMSans_500Medium', fontSize: 13, color: Colors.accent },
  divider:       { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },

  // Budget
  budgetSummary:    { marginBottom: 14, gap: 8 },
  budgetSummaryRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  budgetSpent:      { fontFamily: 'JetBrainsMono_700Bold', fontSize: 18, color: Colors.text },
  budgetLimit:      { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSec, flex: 1 },
  budgetPct:        { fontFamily: 'JetBrainsMono_700Bold', fontSize: 16 },
  budgetGrid:       { gap: 10 },
  budgetGridItem:   { backgroundColor: Colors.cardHover, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
  budgetItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  budgetItemName:   { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.text },
  budgetItemValues: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 11, color: Colors.text, marginTop: 2 },
  budgetItemLimit:  { fontFamily: 'JetBrainsMono_400Regular', color: Colors.textSec },
  budgetItemPct:    { fontFamily: 'JetBrainsMono_700Bold', fontSize: 13 },

  // Investments
  investRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  investLabel:     { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textSec },
  investVarBadge:  { backgroundColor: Colors.accentDim, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.accent + '40' },
  investVarText:   { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: Colors.accent },

  // AI Card
  aiCard:      { backgroundColor: Colors.card, borderRadius: 20, borderWidth: 1, borderColor: Colors.accent + '44', padding: 18, overflow: 'hidden', gap: 14 },
  aiGradient:  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Colors.accentDim, opacity: 0.4 },
  aiHeader:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiIconWrap:  { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.accentDim, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.accent + '55' },
  aiTitle:     { fontFamily: 'DMSans_700Bold', fontSize: 16, color: Colors.text },
  aiOnlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  aiOnlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.accent },
  aiOnlineText:{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.accent },
  aiChevron:   { fontSize: 26, color: Colors.accent, marginRight: -4 },
  aiTipBox:    { backgroundColor: Colors.bg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border, gap: 6 },
  aiTipLabel:  { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: Colors.accent, textTransform: 'uppercase', letterSpacing: 0.5 },
  aiTipText:   { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSec, lineHeight: 19 },
  aiCTA:       { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  aiCTAText:   { fontFamily: 'DMSans_700Bold', fontSize: 14, color: Colors.bg },
});
