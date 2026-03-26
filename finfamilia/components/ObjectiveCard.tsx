import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { fmt, pct } from '../lib/utils';
import type { FinancialObjective } from '../types';
import { ProgressBar } from './ui/ProgressBar';

interface ObjectiveCardProps {
  objective: FinancialObjective;
  onPress?: () => void;
}

export function ObjectiveCard({ objective, onPress }: ObjectiveCardProps) {
  const progress = pct(objective.current_amount, objective.target_amount);
  const color = objective.color ?? Colors.accent;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{objective.icon ?? '🎯'}</Text>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>{objective.name}</Text>
          <Text style={styles.sub}>
            {fmt(objective.current_amount)} de {fmt(objective.target_amount)}
          </Text>
        </View>
        <Text style={[styles.pct, { color }]}>{progress.toFixed(0)}%</Text>
      </View>
      <ProgressBar
        value={objective.current_amount}
        max={objective.target_amount}
        color={color}
        height={5}
        style={{ marginTop: 10 }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pressed: { opacity: 0.7 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: Colors.text,
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textSec,
    marginTop: 2,
  },
  pct: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 14,
  },
});
