import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface PillProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Pill({ label, active = false, onPress, style }: PillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        pressed && styles.pillPressed,
        style,
      ]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
  },
  pillPressed: {
    opacity: 0.7,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Colors.textSec,
  },
  labelActive: {
    color: Colors.accent,
  },
});
