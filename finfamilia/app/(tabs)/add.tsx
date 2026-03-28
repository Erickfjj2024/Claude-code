import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pill } from '../../components/ui/Pill';
import { IconBox } from '../../components/ui/IconBox';
import { Colors } from '../../constants/colors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';
import { supabase } from '../../lib/supabase';

// ─── Grid items ───────────────────────────────────────────────────────────────
const GRID_ITEMS = [
  { key: 'expense',    icon: '💸', label: 'Despesa',     color: Colors.red    },
  { key: 'income',     icon: '💵', label: 'Receita',     color: Colors.accent },
  { key: 'bill',       icon: '📋', label: 'Conta',       color: Colors.orange },
  { key: 'objective',  icon: '🎯', label: 'Objetivo',    color: Colors.purple },
  { key: 'card',       icon: '💳', label: 'Cartão',      color: Colors.blue   },
  { key: 'investment', icon: '📈', label: 'Investimento',color: Colors.yellow },
] as const;

type GridKey = typeof GRID_ITEMS[number]['key'];

type PaymentMethod = 'pix' | 'boleto' | 'card' | 'cash';
const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: 'pix',    label: 'PIX',     icon: '⚡' },
  { key: 'card',   label: 'Cartão',  icon: '💳' },
  { key: 'boleto', label: 'Boleto',  icon: '📄' },
  { key: 'cash',   label: 'Dinheiro',icon: '💵' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AddScreen() {
  const router = useRouter();
  const [modalType, setModalType] = useState<GridKey | null>(null);

  function handleGridPress(key: GridKey) {
    if (key === 'expense' || key === 'income') {
      setModalType(key);
    } else if (key === 'bill') {
      router.push('/bills');
    } else if (key === 'investment') {
      router.push('/investments');
    } else if (key === 'card') {
      router.push('/cards');
    } else {
      router.push('/planner');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Adicionar</Text>
        <Text style={styles.subtitle}>O que deseja registrar?</Text>

        {/* Grid 2×3 */}
        <View style={styles.grid}>
          {GRID_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => handleGridPress(item.key)}
              style={({ pressed }) => [
                styles.gridItem,
                { borderColor: item.color + '33' },
                pressed && styles.gridItemPressed,
              ]}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: item.color + '1A' }]}>
                <Text style={styles.gridIcon}>{item.icon}</Text>
              </View>
              <Text style={[styles.gridLabel, { color: item.color }]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.tip}>
          <Text style={styles.tipText}>
            💡 Toque em <Text style={{ color: Colors.text }}>Despesa</Text> ou <Text style={{ color: Colors.text }}>Receita</Text> para lançar agora
          </Text>
        </View>
      </ScrollView>

      {/* Transaction Modal */}
      <TransactionModal
        visible={modalType === 'expense' || modalType === 'income'}
        type={modalType === 'income' ? 'income' : 'expense'}
        onClose={() => setModalType(null)}
        onSuccess={() => {
          setModalType(null);
          router.push('/(tabs)/transactions');
        }}
      />
    </SafeAreaView>
  );
}

// ─── Transaction Modal ────────────────────────────────────────────────────────
interface TransactionModalProps {
  visible: boolean;
  type: 'expense' | 'income';
  onClose: () => void;
  onSuccess: () => void;
}

function TransactionModal({ visible, type, onClose, onSuccess }: TransactionModalProps) {
  const slideAnim = useRef(new Animated.Value(600)).current;

  const [amount, setAmount]           = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate]               = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId]   = useState<string | null>(null);
  const [payment, setPayment]         = useState<PaymentMethod>('pix');
  const [saving, setSaving]           = useState(false);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const isExpense  = type === 'expense';
  const accentColor = isExpense ? Colors.red : Colors.accent;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  function resetForm() {
    setAmount('');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setCategoryId(null);
    setPayment('pix');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function formatAmount(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    const num = parseInt(digits, 10) / 100;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function parseAmount(formatted: string): number {
    return parseFloat(formatted.replace(/\./g, '').replace(',', '.')) || 0;
  }

  async function handleSave() {
    const numAmount = parseAmount(amount);
    if (numAmount <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Descrição obrigatória', 'Informe uma descrição para a transação.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('transactions').insert({
        date,
        description: description.trim(),
        amount: numAmount,
        type,
        payment_method: payment,
        category_id: categoryId ?? undefined,
        is_recurring: false,
      });

      if (error) throw error;

      resetForm();
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar transação.';
      Alert.alert('Erro', msg);
    } finally {
      setSaving(false);
    }
  }

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalWrapper}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Modal header */}
          <View style={styles.modalHeader}>
            <View style={[styles.modalIconWrap, { backgroundColor: accentColor + '22' }]}>
              <Text style={{ fontSize: 22 }}>{isExpense ? '💸' : '💵'}</Text>
            </View>
            <Text style={styles.modalTitle}>
              {isExpense ? 'Nova Despesa' : 'Nova Receita'}
            </Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Amount */}
            <View style={styles.amountSection}>
              <Text style={styles.amountPrefix}>R$</Text>
              <TextInput
                style={[styles.amountInput, { color: accentColor }]}
                value={amount}
                onChangeText={(v) => setAmount(formatAmount(v))}
                keyboardType="numeric"
                placeholder="0,00"
                placeholderTextColor={Colors.textDim}
                autoFocus
              />
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Descrição</Text>
              <TextInput
                style={styles.fieldInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Ex: Mercado, Salário, Netflix..."
                placeholderTextColor={Colors.textDim}
              />
            </View>

            {/* Date */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Data</Text>
              <TextInput
                style={styles.fieldInput}
                value={date}
                onChangeText={setDate}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={Colors.textDim}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            {/* Category */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Categoria</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                    style={[
                      styles.categoryChip,
                      categoryId === cat.id && {
                        backgroundColor: cat.color + '22',
                        borderColor: cat.color,
                      },
                    ]}
                  >
                    <IconBox icon={cat.icon} color={cat.color} size={28} />
                    <Text
                      style={[
                        styles.categoryChipText,
                        categoryId === cat.id && { color: cat.color },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Payment method */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Forma de pagamento</Text>
              <View style={styles.paymentRow}>
                {PAYMENT_METHODS.map((m) => (
                  <Pressable
                    key={m.key}
                    onPress={() => setPayment(m.key)}
                    style={[
                      styles.paymentChip,
                      payment === m.key && {
                        backgroundColor: accentColor + '22',
                        borderColor: accentColor,
                      },
                    ]}
                  >
                    <Text style={styles.paymentIcon}>{m.icon}</Text>
                    <Text
                      style={[
                        styles.paymentLabel,
                        payment === m.key && { color: accentColor },
                      ]}
                    >
                      {m.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Save */}
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveBtn,
                { backgroundColor: accentColor },
                pressed && { opacity: 0.85 },
                saving && { opacity: 0.6 },
              ]}
            >
              {saving ? (
                <ActivityIndicator color={Colors.bg} />
              ) : (
                <Text style={styles.saveBtnText}>
                  {isExpense ? '💸 Salvar Despesa' : '💵 Salvar Receita'}
                </Text>
              )}
            </Pressable>

            <View style={{ height: 32 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: Colors.bg },
  content:  { padding: 20, paddingBottom: 40 },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 26,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.textSec,
    marginBottom: 24,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  gridItem: {
    width: '30%',
    flexGrow: 1,
    aspectRatio: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  gridItemPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  gridIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIcon:  { fontSize: 26 },
  gridLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    textAlign: 'center',
  },
  tip: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Colors.textSec,
    textAlign: 'center',
  },

  // Modal
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textDim,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  modalIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    flex: 1,
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: Colors.text,
  },
  closeBtn: { padding: 4 },
  closeBtnText: {
    fontSize: 16,
    color: Colors.textSec,
  },

  // Amount
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 8,
    gap: 8,
  },
  amountPrefix: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 22,
    color: Colors.textSec,
  },
  amountInput: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 40,
    minWidth: 160,
    textAlign: 'center',
  },

  // Fields
  field: { marginBottom: 18 },
  fieldLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    color: Colors.textSec,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: Colors.text,
  },

  // Category
  categoryScroll: { gap: 8, paddingBottom: 4 },
  categoryChip: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    minWidth: 72,
  },
  categoryChipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: Colors.textSec,
    textAlign: 'center',
  },

  // Payment
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentChip: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
  },
  paymentIcon:  { fontSize: 18 },
  paymentLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: Colors.textSec,
  },

  // Save button
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: Colors.bg,
  },
});
