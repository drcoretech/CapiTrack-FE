import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Trash2, Calendar as CalendarIcon } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { ExpenseCategory } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { CalendarDatePickerModal, formatHumanDate } from '../../components/CalendarDatePickerModal';

export const EditExpenseModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const editingExpense = useAppStore((state) => state.editingExpense);
  const updateExpense = useAppStore((state) => state.updateExpense);
  const deleteExpense = useAppStore((state) => state.deleteExpense);
  const categories = useAppStore((state) => state.categories);
  const { t, getCategoryName } = useTranslation();

  const activeCategories = categories.filter((c) => c.enabled);

  const [amountStr, setAmountStr] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>('Food');
  const [note, setNote] = useState('');
  const [dateChoice, setDateChoice] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDateStr, setCustomDateStr] = useState('');
  const [customDateLabel, setCustomDateLabel] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const isVisible = activeModal === 'edit_expense' && editingExpense !== null;

  useEffect(() => {
    if (editingExpense) {
      setAmountStr(String(editingExpense.amount));
      setSelectedCategory(editingExpense.category);
      setNote(editingExpense.note || '');

      const expDate = editingExpense.date ? new Date(editingExpense.date) : new Date(editingExpense.createdAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (expDate.toDateString() === today.toDateString()) {
        setDateChoice('today');
        const iso = today.toISOString().split('T')[0];
        setCustomDateStr(iso);
        setCustomDateLabel('Today');
      } else if (expDate.toDateString() === yesterday.toDateString()) {
        setDateChoice('yesterday');
        const iso = yesterday.toISOString().split('T')[0];
        setCustomDateStr(iso);
        setCustomDateLabel('Yesterday');
      } else {
        setDateChoice('custom');
        const iso = expDate.toISOString().split('T')[0];
        setCustomDateStr(iso);
        setCustomDateLabel(formatHumanDate(iso));
      }
    }
  }, [editingExpense]);

  const handleSave = () => {
    if (!editingExpense) return;
    const num = parseFloat(amountStr) || 0;
    if (num <= 0) return;

    let targetDate: string | undefined = undefined;
    if (dateChoice === 'today') {
      targetDate = new Date().toISOString();
    } else if (dateChoice === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      targetDate = y.toISOString();
    } else if (dateChoice === 'custom' && customDateStr.trim()) {
      const parsed = new Date(customDateStr.trim());
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed.toISOString();
      }
    }

    updateExpense(editingExpense.id, {
      amount: num,
      category: selectedCategory,
      note: note.trim(),
      date: targetDate,
    });
    Keyboard.dismiss();
  };

  const handleDelete = () => {
    if (!editingExpense) return;
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete this expense of ₹${editingExpense.amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(editingExpense.id),
        },
      ]
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeModal}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.avoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <Text style={styles.title}>Edit Expense</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.closeBtn}>
              <X size={20} color={Colors.inkSoft} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Amount Box */}
            <View style={styles.amountContainer}>
              <Text style={styles.curLabel}>{t('amountLabel')}</Text>
              <TextInput
                value={amountStr}
                onChangeText={setAmountStr}
                keyboardType="numeric"
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor={Colors.line}
              />
            </View>

            {/* Category Grid */}
            <View style={styles.categoryGrid}>
              {activeCategories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                const localizedLabel = getCategoryName(cat.name);

                return (
                  <AnimatedPressable
                    key={cat.id}
                    scaleTo={0.91}
                    onPress={() => {
                      setSelectedCategory(cat.name);
                      Keyboard.dismiss();
                    }}
                    style={[styles.catBtn, isSelected && styles.catBtnSelected]}
                  >
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                    <Text style={[styles.catLabel, isSelected && styles.catLabelSelected]}>
                      {localizedLabel}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>

            {/* Note Input */}
            <View style={styles.noteContainer}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t('noteExpensePlaceholder')}
                placeholderTextColor={Colors.inkSoft}
                style={styles.textInput}
              />
            </View>

            {/* Date Selector */}
            <View style={styles.dateSection}>
              <Text style={styles.sectionLabel}>DATE</Text>
              <View style={styles.dateChipsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setDateChoice('today');
                    Keyboard.dismiss();
                  }}
                  style={[styles.dateChip, dateChoice === 'today' && styles.dateChipActive]}
                >
                  <Text style={[styles.dateChipText, dateChoice === 'today' && styles.dateChipTextActive]}>
                    {t('dayToday')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setDateChoice('yesterday');
                    Keyboard.dismiss();
                  }}
                  style={[styles.dateChip, dateChoice === 'yesterday' && styles.dateChipActive]}
                >
                  <Text style={[styles.dateChipText, dateChoice === 'yesterday' && styles.dateChipTextActive]}>
                    {t('dayYesterday')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowCalendar(true);
                  }}
                  style={[
                    styles.dateChip,
                    styles.dateChipCustom,
                    dateChoice === 'custom' && styles.dateChipActive,
                  ]}
                >
                  <CalendarIcon
                    size={14}
                    color={dateChoice === 'custom' ? '#ffffff' : Colors.moss}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.dateChipText, dateChoice === 'custom' && styles.dateChipTextActive]}>
                    {dateChoice === 'custom' && customDateLabel
                      ? customDateLabel
                      : 'Choose Date...'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <AnimatedPressable scaleTo={0.96} onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </AnimatedPressable>

            <TouchableOpacity activeOpacity={0.7} onPress={handleDelete} style={styles.deleteBtn}>
              <Trash2 size={16} color={Colors.brick} />
              <Text style={styles.deleteBtnText}>Delete Expense</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Visual Interactive Calendar Modal */}
        <CalendarDatePickerModal
          visible={showCalendar}
          selectedDateStr={customDateStr}
          onSelectDate={(isoStr, label) => {
            setCustomDateStr(isoStr);
            setCustomDateLabel(label);
            setDateChoice('custom');
          }}
          onClose={() => setShowCalendar(false)}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  avoidingView: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 8,
  },
  eyebrow: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 24,
    color: Colors.ink,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  amountContainer: {
    marginVertical: 14,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  curLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
    marginBottom: 6,
  },
  amountInput: {
    fontFamily: Fonts.serifMedium,
    fontSize: 44,
    color: Colors.ink,
    padding: 0,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 6,
  },
  catBtnSelected: {
    backgroundColor: Colors.moss,
    borderColor: Colors.moss,
  },
  catIcon: {
    fontSize: 16,
  },
  catLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  catLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  noteContainer: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.sansRegular,
    fontSize: 15,
    color: Colors.ink,
  },
  dateSection: {
    marginBottom: 16,
  },
  dateChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  dateChipActive: {
    backgroundColor: Colors.moss,
    borderColor: Colors.moss,
  },
  dateChipText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  dateChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  dateChipCustom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 10,
  },
  saveBtn: {
    backgroundColor: Colors.moss,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.brick + '40',
    gap: 6,
  },
  deleteBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.brick,
    fontWeight: '500',
  },
});
