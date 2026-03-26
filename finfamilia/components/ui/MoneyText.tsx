import React from 'react';
import { Text, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { fmt, fmtShort } from '../../lib/utils';

interface MoneyTextProps {
  value: number;
  style?: TextStyle;
  /** If true uses fmtShort (e.g. "R$ 1,5M") */
  short?: boolean;
  /** If true, positive = accent green; negative = red */
  colorize?: boolean;
  /** Font size (default 16) */
  size?: number;
  bold?: boolean;
}

export function MoneyText({
  value,
  style,
  short = false,
  colorize = false,
  size = 16,
  bold = true,
}: MoneyTextProps) {
  const text = short ? fmtShort(value) : fmt(value);

  let color: string = Colors.text;
  if (colorize) {
    color = value >= 0 ? Colors.accent : Colors.red;
  }

  return (
    <Text
      style={[
        {
          fontFamily: bold ? 'JetBrainsMono_700Bold' : 'JetBrainsMono_400Regular',
          fontSize: size,
          color,
          letterSpacing: -0.5,
        },
        style,
      ]}
    >
      {text}
    </Text>
  );
}
