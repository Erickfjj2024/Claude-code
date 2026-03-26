import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

export default function CardsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Mock card visual */}
        <View style={styles.cardVisual}>
          <Text style={styles.cardBrand}>💳 VISA</Text>
          <Text style={styles.cardNumber}>•••• •••• •••• 4242</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardLabel}>Fatura atual</Text>
            <Text style={styles.cardValue}>R$ 2.840,00</Text>
          </View>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.icon}>💳</Text>
          <Text style={styles.desc}>Tela de Cartões</Text>
          <Text style={styles.sub}>CRUD completo de cartões será construído na Fase 9.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  cardVisual: {
    backgroundColor: Colors.purple,
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  cardBrand: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  cardNumber: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 18,
    color: 'white',
    letterSpacing: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  cardValue: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 16,
    color: 'white',
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
