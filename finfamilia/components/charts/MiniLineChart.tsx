import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Polyline, Stop } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface MiniLineChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  showGradient?: boolean;
  style?: ViewStyle;
}

export function MiniLineChart({
  data,
  color = Colors.accent,
  width = 80,
  height = 36,
  showGradient = false,
  style,
}: MiniLineChartProps) {
  if (!data || data.length < 2) return <View style={[{ width, height }, style]} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + ((max - v) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pointsStr = points.join(' ');

  // Build SVG path for gradient fill
  const pathPoints = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + ((max - v) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathD = pathPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const fillPath = `${pathD} L ${(width - padding).toFixed(1)} ${height} L ${padding} ${height} Z`;

  return (
    <View style={style}>
    <Svg width={width} height={height}>
      {showGradient && (
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
      )}
      {showGradient && (
        <Path d={fillPath} fill="url(#grad)" />
      )}
      <Polyline
        points={pointsStr}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
    </View>
  );
}
