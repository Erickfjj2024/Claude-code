import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import type { AIMessage } from '../types';

interface AIMessageBubbleProps {
  message: AIMessage;
}

export function AIMessageBubble({ message }: AIMessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.wrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}>
      {!isUser && <Text style={styles.avatar}>🤖</Text>}
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text style={[styles.text, isUser && styles.userText]}>{message.content}</Text>
      </View>
      {isUser && <Text style={styles.avatar}>👤</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 16,
    gap: 8,
    alignItems: 'flex-end',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  assistantWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    padding: 12,
    borderRadius: 14,
  },
  assistantBubble: {
    backgroundColor: Colors.card,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.accentDim,
    borderRightWidth: 3,
    borderRightColor: Colors.accent,
    borderTopRightRadius: 4,
  },
  text: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  userText: {
    color: Colors.text,
  },
  avatar: {
    fontSize: 18,
  },
});
