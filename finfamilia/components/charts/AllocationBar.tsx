import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

export interface AllocationSegment {
  label: string;
  value: number; // percentage 0–100
  color: string;
}

interface AllocationBarProps {
  segments: AllocationSegment[];
  height?: number;
  showLegend?: boolean;
  style?: ViewStyle;
}

export function AllocationBar({
  segments,
  height = 8,
  showLegend = true,
  style,
}: AllocationBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  return (
    <View style={style}>
      {/* Segmented bar */}
      <View style={[styles.bar, { height, borderRadius: height / 2 }]}>
        {segments.map((seg, idx) => {
          const width = `${(seg.value / total) * 100}%` as `${number}%`;
          return (
            <View
              key={idx}
              style={{
                width,
                height: '100%',
                backgroundColor: seg.color,
                borderRadius: idx === 0
                  ? `${height / 2}px ${0}px ${0}px ${height / 2}px` as never
                  : idx === segments.length - 1
                  ? `${0}px ${height / 2}px ${height / 2}px ${0}px` as never
                  : undefined,
              }}
            />
          );
        })}
      </View>

      {/* Legend */}
      {showLegend && (
        <View style={styles.legend}>
          {segments.map((seg, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: seg.color }]} />
              <Text style={styles.legendLabel}>
                {seg.label}{' '}
                <Text style={styles.legendValue}>
                  {((seg.value / total) * 100).toFixed(0)}%
                </Text>
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    overflow: 'hidden',
    width: '100%',
    backgroundColor: Colors.cardHover,
    gap: 2,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textSec,
  },
  legendValue: {
    fontFamily: 'DMSans_600SemiBold',
    color: Colors.text,
  },
});
