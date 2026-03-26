import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padding?: number;
  radius?: number;
  borderColor?: string;
}

export function Card({
  children,
  style,
  padding = 16,
  radius = 16,
  borderColor = Colors.border,
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        { padding, borderRadius: radius, borderColor },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
