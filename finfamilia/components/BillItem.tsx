import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { fmt, fmtDate } from '../lib/utils';
import type { Bill } from '../types';
import { Badge } from './ui/Badge';
import { IconBox } from './ui/IconBox';

const STATUS_LABELS: Record<Bill['status'], string> = {
  pending: 'A pagar',
  paid: '✓ Pago',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
};

const STATUS_VARIANTS: Record<Bill['status'], 'default' | 'accent' | 'red' | 'orange'> = {
  pending: 'orange',
  paid: 'accent',
  overdue: 'red',
  cancelled: 'default',
};

interface BillItemProps {
  bill: Bill;
  onPress?: () => void;
}

export function BillItem({ bill, onPress }: BillItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.statusDot}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor:
                bill.status === 'paid'
                  ? Colors.accent
                  : bill.status === 'overdue'
                  ? Colors.red
                  : Colors.orange,
            },
          ]}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{bill.name}</Text>
        <Text style={styles.date}>Vence {fmtDate(bill.due_date)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{fmt(bill.amount)}</Text>
        <Badge label={STATUS_LABELS[bill.status]} variant={STATUS_VARIANTS[bill.status]} small />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  pressed: { opacity: 0.7 },
  statusDot: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: Colors.text,
  },
  date: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.textSec,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 14,
    color: Colors.text,
  },
});
