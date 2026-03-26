import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function AIAnalysisScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.ticker}>{ticker?.toUpperCase()}</Text>
          <Text style={styles.subtitle}>Análise completa via IA</Text>
        </View>

        <View style={styles.tabs}>
          {['Passado', 'Presente', 'Futuro'].map((tab, i) => (
            <View key={tab} style={[styles.tab, i === 0 && styles.tabActive]}>
              <Text style={[styles.tabText, i === 0 && styles.tabTextActive]}>{tab}</Text>
            </View>
          ))}
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.icon}>📊</Text>
          <Text style={styles.desc}>Análise de {ticker}</Text>
          <Text style={styles.sub}>
            Análise completa com 3 cenários e veredicto{'\n'}personalizado será implementada na Fase 8.
          </Text>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Análise educacional. Não constitui recomendação de investimento nos termos da CVM.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  ticker: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 32,
    color: Colors.accent,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.textSec,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.accentDim,
  },
  tabText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Colors.textSec,
  },
  tabTextActive: {
    color: Colors.accent,
    fontFamily: 'DMSans_700Bold',
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
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
    lineHeight: 20,
  },
  disclaimer: {
    backgroundColor: Colors.orangeDim,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.orange + '44',
  },
  disclaimerText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.orange,
    textAlign: 'center',
  },
});
