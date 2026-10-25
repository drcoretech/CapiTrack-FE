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
  Keyboard,
} from 'react-native';
import { styles } from './ExpenseModal.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar as CalendarIcon, Zap, Check } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { ExpenseCategory } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { CalendarDatePickerModal } from '../../components/CalendarDatePickerModal';
import { MonthPickerModal, formatMonthLabel, getMonthEndISOString } from '../../components/MonthPickerModal';
import { CategoryIcon } from '../../components/CategoryIcon';
import { useKeyboard } from '../../hooks/useKeyboard';
import { haptics } from '../../services/haptics';

export const AddExpenseModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const addExpense = useAppStore((state) => state.addExpense);
  const categories = useAppStore((state) => state.categories);
  const { t, getCategoryName } = useTranslation();

  const activeCategories = categories.filter((c) => c.enabled);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const prevMonthNum = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYearNum = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Entry Mode: 'single' (normal daily spend) or 'month_total' (lump sum for an entire month)
  const [entryMode, setEntryMode] = useState<'single' | 'month_total'>('single');
  const [selectedMonthYear, setSelectedMonthYear] = useState({
    year: prevYearNum,
    month: prevMonthNum,
    label: formatMonthLabel(prevYearNum, prevMonthNum),
  });
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const [amountStr, setAmountStr] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>(
    activeCategories[0]?.name || 'Food'
  );
  const [note, setNote] = useState('');
  const [dateChoice, setDateChoice] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDateStr, setCustomDateStr] = useState('');
  const [customDateLabel, setCustomDateLabel] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  const isVisible = activeModal === 'add_expense';

  useEffect(() => {
    if (activeCategories.length > 0 && !activeCategories.some((c) => c.name === selectedCategory)) {
      setSelectedCategory(activeCategories[0].name);
    }
  }, [categories]);

  const handleModeSwitch = (mode: 'single' | 'month_total') => {
    haptics.selection();
    setEntryMode(mode);
    Keyboard.dismiss();
  };

  const handleMonthSelected = (year: number, month: number, label: string) => {
    haptics.selection();
    setSelectedMonthYear({ year, month, label });
  };

  const handleSave = () => {
    const num = parseFloat(amountStr) || 0;
    if (num <= 0) {
      haptics.warning();
      return;
    }

    let targetDate: string | undefined = undefined;
    let finalNote = note.trim();
    let targetCategory = selectedCategory;

    if (entryMode === 'month_total') {
      targetCategory = 'Other';
      // Set date to the final second of the chosen month so it strictly falls inside it
      targetDate = getMonthEndISOString(selectedMonthYear.year, selectedMonthYear.month);
      const cleanNoteText = finalNote.replace(/\[Monthly Total\]\s*/g, '');
      finalNote = `[Monthly Total] ${cleanNoteText || `${selectedMonthYear.label} Total Expense`}`;
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

    haptics.success();
    addExpense(num, targetCategory, finalNote, targetDate);
    setAmountStr('');
    setNote('');
    setDateChoice('today');
    setCustomDateStr('');
    setCustomDateLabel('');
    setShowCalendar(false);
    setShowMonthPicker(false);
    setEntryMode('single');
    Keyboard.dismiss();
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
          {/* Top Bar with Dismiss */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.eyebrow}>{t('newEntry')}</Text>
              <Text style={styles.title}>
                {entryMode === 'month_total' ? 'Full Month Total' : t('addExpense')}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.closeBtn}>
              <X size={20} color={Colors.inkSoft} />
            </TouchableOpacity>
          </View>

          {/* Entry Mode Switcher Tabs */}
          <View style={styles.modeSwitchWrapper}>
            <View style={styles.modeSwitchBar}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleModeSwitch('single')}
                style={[
                  styles.modeTab,
                  entryMode === 'single' && styles.modeTabActive,
                ]}
              >
                <Zap
                  size={14}
                  color={entryMode === 'single' ? '#FFFFFF' : Colors.inkSoft}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.modeTabText,
                    entryMode === 'single' && styles.modeTabTextActive,
                  ]}
                >
                  Single Spend
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleModeSwitch('month_total')}
                style={[
                  styles.modeTab,
                  entryMode === 'month_total' && styles.modeTabActive,
                ]}
              >
                <CalendarIcon
                  size={14}
                  color={entryMode === 'month_total' ? '#FFFFFF' : Colors.inkSoft}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.modeTabText,
                    entryMode === 'month_total' && styles.modeTabTextActive,
                  ]}
                >
                  Full Month Total
                </Text>
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
            {/* Amount Section */}
            <View style={styles.amountContainer}>
              <Text style={styles.curLabel}>
                {entryMode === 'month_total' ? 'TOTAL SPENT FOR THE MONTH' : t('amountLabel')}
              </Text>
              <View style={styles.amountInputRow}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  value={amountStr}
                  onChangeText={setAmountStr}
                  keyboardType="numeric"
                  style={styles.amountInput}
                  placeholder={entryMode === 'month_total' ? '12500' : '0'}
                  placeholderTextColor={Colors.line}
                  autoFocus={false}
                />
              </View>

              {/* Quick Amount Increment Presets */}
              <View style={styles.quickAmountRow}>
                {[50, 100, 200, 500, 1000].map((increment) => (
                  <TouchableOpacity
                    key={increment}
                    activeOpacity={0.7}
                    onPress={() => {
                      haptics.selection();
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

            {/* If in Month Total mode, show Month Selector first */}
            {entryMode === 'month_total' ? (
              <View style={styles.monthCardContainer}>
                <View style={styles.monthHeaderRow}>
                  <Text style={styles.dateLabel}>TARGET MONTH</Text>
                  <View style={styles.lumpSumBadge}>
                    <Text style={styles.lumpSumBadgeText}>Lump Sum</Text>
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
                      <Text style={styles.monthSelectSubtitle}>Tap to pick another month</Text>
                    </View>
                  </View>
                  <View style={styles.changePill}>
                    <Text style={styles.changePillText}>Change ▾</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.monthHintBox}>
                  <Text style={styles.monthHintText}>
                    💡 Records ₹{amountStr || '0'} as your total spend for {selectedMonthYear.label}. This will update {selectedMonthYear.label}'s monthly insights, totals & history without needing daily receipts.
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Category Grid (Only for Single Spend mode) */}
            {entryMode === 'single' && (
              <View>
                <Text style={styles.sectionHeader}>CATEGORY</Text>
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
                        style={[styles.catChip, isSelected && styles.catChipSelected]}
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
            )}

            {/* Note Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.sectionHeader}>NOTE / DESCRIPTION</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={
                  entryMode === 'month_total'
                    ? `${selectedMonthYear.label} Total (optional note)`
                    : t('noteExpensePlaceholder')
                }
                placeholderTextColor={Colors.inkSoft}
                style={styles.textInput}
              />
            </View>

            {/* Date Selection (Only for Single Spend mode) */}
            {entryMode === 'single' && (
              <View style={styles.dateSection}>
                <Text style={styles.dateLabel}>DATE</Text>
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
                    <Text
                      style={[
                        styles.dateChipText,
                        dateChoice === 'custom' && styles.dateChipTextActive,
                      ]}
                    >
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
              <Text style={styles.saveBtnText}>
                {entryMode === 'month_total'
                  ? `Save ${selectedMonthYear.label} Total`
                  : t('saveExpense')}
              </Text>
            </AnimatedPressable>
          </View>
        </KeyboardAvoidingView>

        {/* Visual Interactive Calendar Modal (for Single Spend) */}
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

        {/* Month & Year Picker Modal (for Full Month Total) */}
        <MonthPickerModal
          visible={showMonthPicker}
          selectedYear={selectedMonthYear.year}
          selectedMonth={selectedMonthYear.month}
          onSelectMonth={handleMonthSelected}
          onClose={() => setShowMonthPicker(false)}
        />
      </SafeAreaView>
    </Modal>
  );
};

