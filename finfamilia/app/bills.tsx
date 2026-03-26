import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

export default function BillsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: Colors.red + '44' }]}>
            <Text style={styles.summaryEmoji}>📤</Text>
            <Text style={styles.summaryLabel}>A pagar</Text>
            <Text style={[styles.summaryValue, { color: Colors.red }]}>R$ 4.200</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: Colors.accent + '44' }]}>
            <Text style={styles.summaryEmoji}>📥</Text>
            <Text style={styles.summaryLabel}>A receber</Text>
            <Text style={[styles.summaryValue, { color: Colors.accent }]}>R$ 12.500</Text>
          </View>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.icon}>📋</Text>
          <Text style={styles.desc}>Contas a Pagar</Text>
          <Text style={styles.sub}>CRUD completo de contas será construído na Fase 9.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryEmoji: { fontSize: 24 },
  summaryLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.textSec,
  },
  summaryValue: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 18,
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
