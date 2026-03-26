import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { fmt, fmtDate } from '../lib/utils';
import type { TransactionWithCategory } from '../types';
import { IconBox } from './ui/IconBox';
import { MoneyText } from './ui/MoneyText';

interface TransactionItemProps {
  transaction: TransactionWithCategory;
  onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  const icon = transaction.category?.icon ?? '💸';
  const color = transaction.category?.color ?? Colors.textSec;
  const catName = transaction.category?.name ?? 'Sem categoria';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <IconBox icon={icon} color={color} size={42} />
      <View style={styles.info}>
        <Text style={styles.desc} numberOfLines={1}>{transaction.description}</Text>
        <Text style={styles.meta}>{catName} · {fmtDate(transaction.date)}</Text>
      </View>
      <MoneyText
        value={isIncome ? transaction.amount : -transaction.amount}
        colorize
        size={14}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  info: {
    flex: 1,
  },
  desc: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: Colors.text,
  },
  meta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.textSec,
    marginTop: 2,
  },
});
