import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { AllocationBar } from '../components/charts/AllocationBar';

const MOCK_ALLOCATION = [
  { label: 'RF', value: 45, color: Colors.accent },
  { label: 'FII', value: 20, color: Colors.blue },
  { label: 'Ações', value: 20, color: Colors.purple },
  { label: 'ETF', value: 10, color: Colors.orange },
  { label: 'Cripto', value: 5, color: Colors.yellow },
];

export default function InvestmentsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total investido</Text>
          <Text style={styles.summaryValue}>R$ 125.400,00</Text>
          <Text style={styles.summaryVar}>+R$ 3.240,00 (+2,65%) esse mês</Text>
          <AllocationBar segments={MOCK_ALLOCATION} height={10} style={{ marginTop: 16 }} />
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.icon}>📈</Text>
          <Text style={styles.desc}>Tela de Investimentos</Text>
          <Text style={styles.sub}>Lista clicável com análise IA será construída na Fase 9.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Colors.textSec,
  },
  summaryValue: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 28,
    color: Colors.text,
    marginTop: 4,
  },
  summaryVar: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Colors.accent,
    marginTop: 4,
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: { fontSize: 40, marginBottom: 12 },
  desc: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 8,
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Colors.textSec,
    textAlign: 'center',
  },
});
