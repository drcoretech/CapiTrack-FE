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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar as CalendarIcon } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { ExpenseCategory } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { CalendarDatePickerModal } from '../../components/CalendarDatePickerModal';

export const AddExpenseModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const addExpense = useAppStore((state) => state.addExpense);
  const categories = useAppStore((state) => state.categories);
  const { t, getCategoryName } = useTranslation();

  const activeCategories = categories.filter((c) => c.enabled);

  const [amountStr, setAmountStr] = useState('150');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>(
    activeCategories[0]?.name || 'Food'
  );
  const [note, setNote] = useState('');
  const [dateChoice, setDateChoice] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDateStr, setCustomDateStr] = useState('');
  const [customDateLabel, setCustomDateLabel] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const isVisible = activeModal === 'add_expense';

  useEffect(() => {
    if (activeCategories.length > 0 && !activeCategories.some((c) => c.name === selectedCategory)) {
      setSelectedCategory(activeCategories[0].name);
    }
  }, [categories]);

  const handleSave = () => {
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

    addExpense(num, selectedCategory, note, targetDate);
    setAmountStr('150');
    setNote('');
    setDateChoice('today');
    setCustomDateStr('');
    setCustomDateLabel('');
    setShowCalendar(false);
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.avoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Top Bar with Dismiss */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.eyebrow}>{t('newEntry')}</Text>
              <Text style={styles.title}>{t('addExpense')}</Text>
            </View>
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
            {/* Amount Section */}
            <View style={styles.amountContainer}>
              <Text style={styles.curLabel}>{t('amountLabel')}</Text>
              <TextInput
                value={amountStr}
                onChangeText={setAmountStr}
                keyboardType="numeric"
                style={styles.amountInput}
                placeholder="150"
                placeholderTextColor={Colors.line}
                autoFocus={false}
              />
            </View>

            {/* Category Grid (dynamic from store with translations) */}
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
                    style={[styles.catChip, isSelected && styles.catChipSelected]}
                  >
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                    <Text style={[styles.catLabel, isSelected && styles.catLabelSelected]}>
                      {localizedLabel}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>

            {/* Note Field */}
            <View style={styles.fieldContainer}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t('noteExpensePlaceholder')}
                placeholderTextColor={Colors.inkSoft}
                style={styles.textInput}
              />
            </View>

            {/* Date Selection */}
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
          </ScrollView>

          {/* Action Button with spring bounce */}
          <View style={styles.footer}>
            <AnimatedPressable scaleTo={0.96} onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>{t('saveExpense')}</Text>
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
    paddingTop: 16,
    paddingBottom: 24,
    gap: 20,
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
    fontSize: 54,
    color: Colors.ink,
    textAlign: 'center',
    paddingVertical: 4,
    minWidth: 160,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  catChip: {
    width: '31%',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  catChipSelected: {
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
  fieldContainer: {
    marginBottom: 16,
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
    marginBottom: 20,
  },
  dateLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
    marginBottom: 8,
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
