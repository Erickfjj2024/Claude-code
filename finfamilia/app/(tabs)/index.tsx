import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { greeting } from '../../lib/utils';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.appName}>FinFamília 👨‍👩‍👧</Text>
          </View>
          <View style={styles.avatars}>
            <View style={[styles.avatar, styles.avatar1]}>
              <Text style={styles.avatarText}>EU</Text>
            </View>
            <View style={[styles.avatar, styles.avatar2]}>
              <Text style={styles.avatarText}>EL</Text>
            </View>
          </View>
        </View>

        {/* Placeholder content */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>🏠</Text>
          <Text style={styles.placeholderTitle}>Tela Home</Text>
          <Text style={styles.placeholderDesc}>
            Dashboard completo será construído na Fase 3.{'\n'}
            Navegação funcionando ✓
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.textSec,
  },
  appName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    color: Colors.text,
    marginTop: 2,
  },
  avatars: {
    flexDirection: 'row',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  avatar1: {
    backgroundColor: Colors.accent,
    zIndex: 2,
  },
  avatar2: {
    backgroundColor: Colors.blue,
    marginLeft: -10,
    zIndex: 1,
  },
  avatarText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: Colors.bg,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 8,
  },
  placeholderDesc: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.textSec,
    textAlign: 'center',
    lineHeight: 20,
  },
});
