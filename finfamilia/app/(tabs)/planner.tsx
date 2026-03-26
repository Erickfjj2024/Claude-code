import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export default function PlannerScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>🧠 Planejar</Text>
        <View style={styles.placeholder}>
          <Text style={styles.icon}>🧠</Text>
          <Text style={styles.desc}>Tela de Planejamento</Text>
          <Text style={styles.sub}>
            Score de saúde, objetivos, mercado e simuladores{'\n'}serão construídos na Fase 6.
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
  placeholder: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: { fontSize: 48, marginBottom: 12 },
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
});
