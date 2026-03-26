import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export default function AddScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>➕ Adicionar</Text>
        <View style={styles.grid}>
          {[
            { icon: '💸', label: 'Despesa', color: Colors.red },
            { icon: '💵', label: 'Receita', color: Colors.accent },
            { icon: '🏦', label: 'Conta', color: Colors.blue },
            { icon: '🎯', label: 'Objetivo', color: Colors.purple },
            { icon: '💳', label: 'Cartão', color: Colors.orange },
            { icon: '📈', label: 'Investimento', color: Colors.yellow },
          ].map((item) => (
            <View
              key={item.label}
              style={[styles.gridItem, { borderColor: item.color + '33' }]}
            >
              <Text style={styles.gridIcon}>{item.icon}</Text>
              <Text style={[styles.gridLabel, { color: item.color }]}>{item.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.placeholder}>
          <Text style={styles.sub}>
            Formulários completos serão construídos na Fase 4.
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
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  gridItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  gridIcon: { fontSize: 28 },
  gridLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  placeholder: {
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Colors.textSec,
    textAlign: 'center',
  },
});
