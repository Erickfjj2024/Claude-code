import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

type BadgeVariant = 'accent' | 'red' | 'orange' | 'blue' | 'purple' | 'yellow' | 'default';

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  accent: { bg: Colors.accentDim, text: Colors.accent },
  red: { bg: Colors.redDim, text: Colors.red },
  orange: { bg: Colors.orangeDim, text: Colors.orange },
  blue: { bg: Colors.blueDim, text: Colors.blue },
  purple: { bg: Colors.purpleDim, text: Colors.purple },
  yellow: { bg: 'rgba(255,217,61,0.15)', text: Colors.yellow },
  default: { bg: Colors.cardHover, text: Colors.textSec },
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  small?: boolean;
}

export function Badge({ label, variant = 'default', style, small = false }: BadgeProps) {
  const { bg, text } = VARIANT_COLORS[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text
        style={[
          styles.label,
          { color: text, fontSize: small ? 10 : 11 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    letterSpacing: 0.2,
  },
});
