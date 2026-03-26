import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface IconBoxProps {
  icon: string;
  color: string;
  size?: number;
  style?: ViewStyle;
}

export function IconBox({ icon, color, size = 40, style }: IconBoxProps) {
  // Create a translucent background (15% opacity) from the hex color
  const bg = hexToRgba(color, 0.15);

  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: bg,
          width: size,
          height: size,
          borderRadius: size * 0.28,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.45 }}>{icon}</Text>
    </View>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  // Handles #RRGGBB
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
