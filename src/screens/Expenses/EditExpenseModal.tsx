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
import { MonthPickerModal, formatMonthLabel, getMonthEndISOString } from '../../components/MonthPickerModal';
import { CategoryIcon } from '../../components/CategoryIcon';
import { useKeyboard } from '../../hooks/useKeyboard';

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
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  // Monthly Total mode states
  const [isMonthlyTotal, setIsMonthlyTotal] = useState(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    label: formatMonthLabel(new Date().getFullYear(), new Date().getMonth() + 1),
  });
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const isVisible = activeModal === 'edit_expense' && editingExpense !== null;

  useEffect(() => {
    if (editingExpense) {
      setAmountStr(String(editingExpense.amount));
      setSelectedCategory(editingExpense.category);

      const isMonthLumpSum = !!editingExpense.note?.includes('[Monthly Total]');
      setIsMonthlyTotal(isMonthLumpSum);

      const expDate = editingExpense.date ? new Date(editingExpense.date) : new Date(editingExpense.createdAt);
      const expYear = expDate.getFullYear();
      const expMonth = expDate.getMonth() + 1;

      setSelectedMonthYear({
        year: expYear,
        month: expMonth,
        label: formatMonthLabel(expYear, expMonth),
      });

      if (isMonthLumpSum) {
        // Strip tag for clean editing in the text box
        setNote((editingExpense.note || '').replace(/\[Monthly Total\]\s*/g, ''));
      } else {
        setNote(editingExpense.note || '');
      }

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
    let finalNote = note.trim();

    if (isMonthlyTotal) {
      targetDate = getMonthEndISOString(selectedMonthYear.year, selectedMonthYear.month);
      finalNote = `[Monthly Total] ${finalNote || `${selectedMonthYear.label} Total Expense`}`;
    } else {
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
    }

    updateExpense(editingExpense.id, {
      amount: num,
      category: selectedCategory,
      note: finalNote,
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
            <View>
              <Text style={styles.eyebrow}>
                {isMonthlyTotal ? 'LUMP SUM RECORD' : 'EDIT ENTRY'}
              </Text>
              <Text style={styles.title}>
                {isMonthlyTotal ? 'Edit Month Total' : 'Edit Expense'}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.closeBtn}>
              <X size={20} color={Colors.inkSoft} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: isKeyboardVisible
                  ? (Platform.OS === 'android' ? keyboardHeight + 80 : 30)
                  : 30,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Amount Box */}
            <View style={styles.amountContainer}>
              <Text style={styles.curLabel}>
                {isMonthlyTotal ? '₹ TOTAL FOR THE MONTH' : t('amountLabel')}
              </Text>
              <TextInput
                value={amountStr}
                onChangeText={setAmountStr}
                keyboardType="numeric"
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor={Colors.line}
              />
            </View>

            {/* Month Total Selector if editing a monthly total */}
            {isMonthlyTotal ? (
              <View style={styles.monthCardContainer}>
                <View style={styles.monthHeaderRow}>
                  <Text style={styles.sectionLabel}>TARGET MONTH</Text>
                  <View style={styles.lumpSumBadge}>
                    <Text style={styles.lumpSumBadgeText}>Monthly Lump Sum</Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowMonthPicker(true);
                  }}
                  style={styles.monthSelectButton}
                >
                  <View style={styles.monthSelectLeft}>
                    <View style={styles.monthIconCircle}>
                      <CalendarIcon size={18} color={Colors.moss} />
                    </View>
                    <View>
                      <Text style={styles.monthSelectTitle}>{selectedMonthYear.label}</Text>
                      <Text style={styles.monthSelectSubtitle}>Tap to switch month & year</Text>
                    </View>
                  </View>
                  <View style={styles.changePill}>
                    <Text style={styles.changePillText}>Change ▾</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Category Grid */}
            <View>
              <Text style={styles.sectionLabel}>CATEGORY</Text>
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
                      <CategoryIcon
                        category={cat.name}
                        icon={cat.icon}
                        size={18}
                        color={isSelected ? Colors.moss : Colors.inkSoft}
                      />
                      <Text style={[styles.catLabel, isSelected && styles.catLabelSelected]}>
                        {localizedLabel}
                      </Text>
                    </AnimatedPressable>
                  );
                })}
              </View>
            </View>

            {/* Note Input */}
            <View style={styles.noteContainer}>
              <Text style={styles.sectionLabel}>NOTE / DESCRIPTION</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t('noteExpensePlaceholder')}
                placeholderTextColor={Colors.inkSoft}
                style={styles.textInput}
              />
            </View>

            {/* Date Selector (Only for regular expenses) */}
            {!isMonthlyTotal && (
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
            )}

            {/* Delete Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDelete}
              style={styles.deleteBtn}
            >
              <Trash2 size={16} color={Colors.brick} />
              <Text style={styles.deleteBtnText}>Delete this expense</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Action Button with spring bounce */}
          <View
            style={[
              styles.footer,
              Platform.OS === 'android' && isKeyboardVisible && { marginBottom: keyboardHeight },
            ]}
          >
            <AnimatedPressable scaleTo={0.96} onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save changes</Text>
            </AnimatedPressable>
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

        {/* Month Picker Modal (for Monthly Total) */}
        <MonthPickerModal
          visible={showMonthPicker}
          selectedYear={selectedMonthYear.year}
          selectedMonth={selectedMonthYear.month}
          onSelectMonth={(year, month, label) => {
            setSelectedMonthYear({ year, month, label });
          }}
          onClose={() => setShowMonthPicker(false)}
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
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 18,
  },
  amountContainer: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  curLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.inkSoft,
    letterSpacing: 0.5,
  },
  amountInput: {
    fontFamily: Fonts.serifMedium,
    fontSize: 52,
    color: Colors.ink,
    textAlign: 'center',
    paddingVertical: 4,
    minWidth: 160,
  },
  monthCardContainer: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 12,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lumpSumBadge: {
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  lumpSumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.amber,
    textTransform: 'uppercase',
  },
  monthSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.mist,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  monthSelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthSelectTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  monthSelectSubtitle: {
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  changePill: {
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  changePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.moss,
  },
  sectionLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  catBtn: {
    width: '31%',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  catBtnSelected: {
    borderColor: Colors.moss,
    backgroundColor: Colors.mossLight,
    borderWidth: 1.5,
  },
  catIcon: {
    fontSize: 24,
  },
  catLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.ink,
  },
  catLabelSelected: {
    color: Colors.moss,
    fontFamily: Fonts.sansSemiBold,
  },
  noteContainer: {
    marginBottom: 4,
  },
  textInput: {
    fontFamily: Fonts.sansRegular,
    fontSize: 15,
    color: Colors.ink,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  dateSection: {
    marginBottom: 10,
  },
  dateChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
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
    fontSize: 13,
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
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.brickLight,
    borderRadius: 14,
    marginTop: 6,
  },
  deleteBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.brick,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  saveBtn: {
    backgroundColor: Colors.moss,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
