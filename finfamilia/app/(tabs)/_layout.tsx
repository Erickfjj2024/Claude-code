import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.emoji, { opacity: focused ? 1 : 0.45 }]}>{emoji}</Text>
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? Colors.accent : Colors.textSec, opacity: focused ? 1 : 0.5 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.8 }]}
    >
      <Text style={styles.addIcon}>＋</Text>
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSec,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transações',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💰" label="Transações" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Adicionar',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="➕" label="Adicionar" focused={focused} />
          ),
          tabBarButton: (props) => (
            <Pressable
              {...(props as object)}
              style={({ pressed }) => [
                styles.addButtonTab,
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={styles.addButtonInner}>
                <Text style={styles.addIcon}>＋</Text>
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planejar',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🧠" label="Planejar" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Mais',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📊" label="Mais" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.card,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 2,
  },
  emoji: {
    fontSize: 22,
  },
  tabLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
  },
  addButtonTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14,
    shadowColor: Colors.accentGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  addButton: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 26,
    color: Colors.bg,
    fontWeight: '700',
    lineHeight: 30,
  },
});
