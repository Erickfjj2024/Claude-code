import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { MiniLineChart } from '../components/charts/MiniLineChart';

const MOCK_INDICATORS = [
  { code: 'SELIC', name: 'Selic', value: '13,75%', variation: '+0,0%', color: Colors.accent, data: [13.25, 13.5, 13.75, 13.75, 13.75] },
  { code: 'CDI', name: 'CDI', value: '13,65%', variation: '+0,0%', color: Colors.accent, data: [13.15, 13.4, 13.65, 13.65, 13.65] },
  { code: 'IPCA', name: 'IPCA', value: '4,83%', variation: '+0,2%', color: Colors.orange, data: [4.2, 4.5, 4.6, 4.7, 4.83] },
  { code: 'USD', name: 'Dólar', value: 'R$ 5,82', variation: '+0,4%', color: Colors.red, data: [5.1, 5.3, 5.5, 5.7, 5.82] },
  { code: 'IBOV', name: 'Ibovespa', value: '128.450', variation: '+1,2%', color: Colors.accent, data: [120000, 123000, 125000, 126000, 128450] },
  { code: 'BTC', name: 'Bitcoin', value: 'R$ 512.000', variation: '+3,1%', color: Colors.yellow, data: [450000, 470000, 490000, 500000, 512000] },
];

export default function MarketScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Indicadores de Mercado</Text>
        <Text style={styles.sectionSub}>Dados em tempo real — Fase 10</Text>

        {MOCK_INDICATORS.map((ind) => (
          <View key={ind.code} style={styles.indicatorCard}>
            <View style={styles.indLeft}>
              <Text style={styles.indCode}>{ind.code}</Text>
              <Text style={styles.indName}>{ind.name}</Text>
            </View>
            <MiniLineChart data={ind.data} color={ind.color} width={70} height={32} />
            <View style={styles.indRight}>
              <Text style={styles.indValue}>{ind.value}</Text>
              <Text style={[styles.indVar, { color: ind.variation.startsWith('+') ? Colors.accent : Colors.red }]}>
                {ind.variation}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.placeholder}>
          <Text style={styles.icon}>📅</Text>
          <Text style={styles.desc}>Calendário Econômico</Text>
          <Text style={styles.sub}>Calendário com eventos COPOM, IPCA etc.{'\n'}será implementado na Fase 10.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 8 },
  sectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: Colors.text,
  },
  sectionSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.textSec,
    marginBottom: 8,
  },
  indicatorCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  indLeft: {
    flex: 1,
  },
  indCode: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 14,
    color: Colors.text,
  },
  indName: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.textSec,
    marginTop: 2,
  },
  indRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  indValue: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 14,
    color: Colors.text,
  },
  indVar: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    marginTop: 2,
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  icon: { fontSize: 36, marginBottom: 10 },
  desc: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 6,
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.textSec,
    textAlign: 'center',
    lineHeight: 18,
  },
});
