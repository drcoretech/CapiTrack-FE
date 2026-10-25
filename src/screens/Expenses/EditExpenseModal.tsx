import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Keyboard,
} from 'react-native';
import { styles } from './ExpenseModal.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Trash2, Pencil, Calendar as CalendarIcon, Check } from 'lucide-react-native';
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
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isVisible = activeModal === 'edit_expense' && editingExpense !== null;

  useEffect(() => {
    if (editingExpense) {
      setAmountStr(String(editingExpense.amount));
      setSelectedCategory(editingExpense.category);

      const isMonthLumpSum = !!editingExpense.note?.includes('[Monthly Total]');
      setIsMonthlyTotal(isMonthLumpSum);

      const rawDate = editingExpense.date || editingExpense.createdAt;
      const parsedDate = rawDate ? new Date(rawDate) : new Date();
      const expDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
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

    Keyboard.dismiss();
    const expId = editingExpense.id || (editingExpense as any)._id;
    updateExpense(expId, {
      amount: num,
      category: selectedCategory,
      note: finalNote,
      date: targetDate,
    });
    closeModal();
  };

  const handleConfirmDelete = () => {
    if (!editingExpense) return;
    const expId = editingExpense.id || (editingExpense as any)._id;
    deleteExpense(expId);
    setShowDeleteConfirm(false);
    closeModal();
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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.avoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.iconButton}>
              <X size={20} color={Colors.inkSoft} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>
              {isMonthlyTotal ? 'Month Total' : 'Edit Expense'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSave}
                style={styles.iconButton}
              >
                <Pencil size={18} color={Colors.inkSoft} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowDeleteConfirm(true)}
                style={styles.iconButton}
              >
                <Trash2 size={18} color={Colors.brick} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Amount Box */}
            <View style={styles.amountContainer}>
              <Text style={styles.curLabel}>
                {isMonthlyTotal ? 'TOTAL SPENT FOR THE MONTH' : t('amountLabel')}
              </Text>
              <View style={styles.amountInputRow}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  value={amountStr}
                  onChangeText={setAmountStr}
                  keyboardType="numeric"
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={Colors.line}
                />
              </View>

              {/* Quick Amount Increment Presets */}
              <View style={styles.quickAmountRow}>
                {[50, 100, 200, 500, 1000].map((increment) => (
                  <TouchableOpacity
                    key={increment}
                    activeOpacity={0.7}
                    onPress={() => {
                      const current = parseFloat(amountStr) || 0;
                      setAmountStr(String(current + increment));
                    }}
                    style={styles.quickAmountChip}
                  >
                    <Text style={styles.quickAmountText}>+{increment}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
                      scaleTo={0.93}
                      onPress={() => {
                        setSelectedCategory(cat.name);
                        Keyboard.dismiss();
                      }}
                      style={[styles.catBtn, isSelected && styles.catBtnSelected]}
                    >
                      {isSelected && (
                        <View style={styles.selectedCheckBadge}>
                          <Check size={8} color="#FFFFFF" strokeWidth={3.5} />
                        </View>
                      )}
                      <CategoryIcon
                        category={cat.name}
                        icon={cat.icon}
                        size={20}
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
          </ScrollView>

          {/* Action Button with spring bounce */}
          <View style={styles.footer}>
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

        {/* Custom Confirmation Modal for Deletion */}
        <ConfirmDeleteModal
          visible={showDeleteConfirm}
          title="Delete Expense?"
          message="Are you sure you want to delete this expense? This action cannot be undone."
          itemBadge={`₹${amountStr} · ${note.trim() || selectedCategory}`}
          confirmLabel="Delete Expense"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </SafeAreaView>
    </Modal>
  );
};

