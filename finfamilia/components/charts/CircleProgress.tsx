import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface CircleProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export function CircleProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = Colors.accent,
  label,
  sublabel,
}: CircleProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference * (1 - ratio);

  // Color based on score
  let arcColor = color;
  if (value >= 80) arcColor = Colors.accent;
  else if (value >= 60) arcColor = Colors.orange;
  else arcColor = Colors.red;

  const center = size / 2;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={Colors.cardHover}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={arcColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.inner]}>
        {label !== undefined ? (
          <Text style={[styles.label, { color: arcColor }]}>{label}</Text>
        ) : (
          <Text style={[styles.score, { color: arcColor }]}>{value}</Text>
        )}
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 28,
  },
  label: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 18,
  },
  sublabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textSec,
    marginTop: 2,
  },
});
