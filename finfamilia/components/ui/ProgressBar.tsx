import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { clamp, pct } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
  style?: ViewStyle;
  /** If true, auto-selects color based on ratio (green/yellow/red) */
  autoColor?: boolean;
}

export function ProgressBar({
  value,
  max,
  color,
  height = 6,
  style,
  autoColor = false,
}: ProgressBarProps) {
  const ratio = max > 0 ? value / max : 0;
  const clamped = clamp(ratio, 0, 1);

  let barColor = color ?? Colors.accent;
  if (autoColor) {
    if (ratio >= 1) barColor = Colors.red;
    else if (ratio >= 0.75) barColor = Colors.orange;
    else barColor = Colors.accent;
  }

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            backgroundColor: barColor,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: Colors.cardHover,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
});
