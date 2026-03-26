import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

const MENU_ITEMS = [
  { icon: '🤖', label: 'Consultor IA', route: '/ai-chat', color: Colors.accent },
  { icon: '📈', label: 'Investimentos', route: '/investments', color: Colors.blue },
  { icon: '💳', label: 'Cartões', route: '/cards', color: Colors.purple },
  { icon: '📋', label: 'Contas a Pagar', route: '/bills', color: Colors.orange },
  { icon: '📊', label: 'Mercado', route: '/market', color: Colors.yellow },
];

export default function MoreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>📊 Mais</Text>

        {/* Sync status bar */}
        <View style={styles.syncBar}>
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>Sincronizado em 2 dispositivos</Text>
          <View style={styles.syncBadges}>
            <View style={styles.deviceBadge}>
              <Text style={styles.deviceText}>Android 1</Text>
            </View>
            <View style={styles.deviceBadge}>
              <Text style={styles.deviceText}>Android 2</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.route as never)}
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '22' }]}>
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.versionBox}>
          <Text style={styles.version}>FinFamília v1.0.0 — Fase 1</Text>
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
    marginBottom: 20,
  },
  syncBar: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  syncText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Colors.text,
    flex: 1,
  },
  syncBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  deviceBadge: {
    backgroundColor: Colors.accentDim,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  deviceText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: Colors.accent,
  },
  menu: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pressed: { opacity: 0.7 },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: Colors.text,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textDim,
  },
  versionBox: {
    alignItems: 'center',
  },
  version: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.textDim,
  },
});
