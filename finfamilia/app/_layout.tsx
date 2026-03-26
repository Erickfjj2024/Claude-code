import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  useFonts as useDMSans,
} from '@expo-google-fonts/dm-sans';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
  useFonts as useJetBrains,
} from '@expo-google-fonts/jetbrains-mono';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dmSansLoaded] = useDMSans({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const [jetBrainsLoaded] = useJetBrains({
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  const fontsLoaded = dmSansLoaded && jetBrainsLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: Colors.bg }} />;
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="ai-chat"
          options={{
            headerShown: true,
            headerTitle: 'Consultor IA',
            headerStyle: { backgroundColor: Colors.card },
            headerTintColor: Colors.text,
            headerTitleStyle: {
              fontFamily: 'DMSans_600SemiBold',
              color: Colors.text,
            },
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="ai-analysis/[ticker]"
          options={{
            headerShown: true,
            headerTitle: 'Análise de Ativo',
            headerStyle: { backgroundColor: Colors.card },
            headerTintColor: Colors.text,
            headerTitleStyle: {
              fontFamily: 'DMSans_600SemiBold',
              color: Colors.text,
            },
          }}
        />
        <Stack.Screen
          name="cards"
          options={{
            headerShown: true,
            headerTitle: 'Cartões',
            headerStyle: { backgroundColor: Colors.card },
            headerTintColor: Colors.text,
            headerTitleStyle: { fontFamily: 'DMSans_600SemiBold', color: Colors.text },
          }}
        />
        <Stack.Screen
          name="investments"
          options={{
            headerShown: true,
            headerTitle: 'Investimentos',
            headerStyle: { backgroundColor: Colors.card },
            headerTintColor: Colors.text,
            headerTitleStyle: { fontFamily: 'DMSans_600SemiBold', color: Colors.text },
          }}
        />
        <Stack.Screen
          name="bills"
          options={{
            headerShown: true,
            headerTitle: 'Contas a Pagar',
            headerStyle: { backgroundColor: Colors.card },
            headerTintColor: Colors.text,
            headerTitleStyle: { fontFamily: 'DMSans_600SemiBold', color: Colors.text },
          }}
        />
        <Stack.Screen
          name="market"
          options={{
            headerShown: true,
            headerTitle: 'Mercado',
            headerStyle: { backgroundColor: Colors.card },
            headerTintColor: Colors.text,
            headerTitleStyle: { fontFamily: 'DMSans_600SemiBold', color: Colors.text },
          }}
        />
      </Stack>
    </>
  );
}
