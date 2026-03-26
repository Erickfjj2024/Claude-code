import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

const QUICK_ACTIONS = [
  'Analisar VALE3',
  'Comparar RF',
  'Revisar carteira',
  'Simular aporte',
];

export default function AIChatScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Online indicator */}
        <View style={styles.statusBar}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>● Online</Text>
        </View>

        {/* Messages area */}
        <ScrollView
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
        >
          {/* Welcome message */}
          <View style={styles.assistantBubble}>
            <Text style={styles.avatar}>🤖</Text>
            <View style={styles.bubbleContent}>
              <Text style={styles.bubbleText}>
                Olá! Sou seu consultor financeiro pessoal.{'\n\n'}
                Posso ajudar você com análise de investimentos, planejamento financeiro,
                comparação de ativos e muito mais.{'\n\n'}
                Como posso ajudar hoje?
              </Text>
            </View>
          </View>

          {/* Placeholder notice */}
          <View style={styles.noticeBubble}>
            <Text style={styles.noticeText}>
              🔧 Chat com IA real será implementado na Fase 7 com integração à API Anthropic.
            </Text>
          </View>
        </ScrollView>

        {/* Quick actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActions}
        >
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity key={action} style={styles.quickPill}>
              <Text style={styles.quickText}>{action}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Pergunte algo ao consultor..."
            placeholderTextColor={Colors.textDim}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.accent,
  },
  onlineText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: Colors.accent,
  },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 12 },
  assistantBubble: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
  },
  avatar: { fontSize: 20 },
  bubbleContent: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderTopLeftRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    padding: 14,
  },
  bubbleText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  noticeBubble: {
    backgroundColor: Colors.accentDim,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.accent + '44',
  },
  noticeText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Colors.textSec,
    textAlign: 'center',
  },
  quickActions: {
    padding: 12,
    gap: 8,
  },
  quickPill: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  quickText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Colors.textSec,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontSize: 18,
    color: Colors.bg,
  },
});
