import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { AnimatedPressable } from './AnimatedPressable';

export interface MonthPickerModalProps {
  visible: boolean;
  selectedYear?: number;
  selectedMonth?: number; // 1 to 12
  onSelectMonth: (year: number, month: number, formattedLabel: string) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatMonthLabel(year: number, month: number): string {
  if (month >= 1 && month <= 12) {
    return `${MONTH_NAMES[month - 1]} ${year}`;
  }
  return `${month}/${year}`;
}

/**
 * Returns an ISO timestamp representing the end of the specified month (e.g. Aug 31 23:59:59)
 * ensuring it stays strictly inside that month when grouped in Mongo / date-range queries.
 */
export function getMonthEndISOString(year: number, month: number): string {
  // Day 0 of next month is the last day of the given month
  const lastDay = new Date(year, month, 0).getDate();
  const date = new Date(year, month - 1, lastDay, 23, 59, 59, 999);
  return date.toISOString();
}

export const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  visible,
  selectedYear,
  selectedMonth,
  onSelectMonth,
  onClose,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  const [viewYear, setViewYear] = useState<number>(selectedYear || currentYear);
  const [activeMonth, setActiveMonth] = useState<number>(selectedMonth || currentMonth);

  useEffect(() => {
    if (visible) {
      setViewYear(selectedYear || currentYear);
      setActiveMonth(selectedMonth || currentMonth);
    }
  }, [visible, selectedYear, selectedMonth]);

  const canGoNextYear = viewYear < currentYear;

  const handlePrevYear = () => {
    setViewYear((y) => y - 1);
  };

  const handleNextYear = () => {
    if (canGoNextYear) {
      setViewYear((y) => y + 1);
    }
  };

  const handleMonthPress = (mIndex: number) => {
    const monthNum = mIndex + 1;
    // Disallow future months
    if (viewYear === currentYear && monthNum > currentMonth) {
      return;
    }
    setActiveMonth(monthNum);
    onSelectMonth(viewYear, monthNum, formatMonthLabel(viewYear, monthNum));
    onClose();
  };

  const applyPreset = (monthsBack: number) => {
    let y = currentYear;
    let m = currentMonth - monthsBack;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    setViewYear(y);
    setActiveMonth(m);
    onSelectMonth(y, m, formatMonthLabel(y, m));
    onClose();
  };

  const lastMonthNum = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}>
                <CalendarIcon size={18} color={Colors.moss} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Select Month</Text>
                <Text style={styles.headerSubtitle}>
                  For full-month lump sum entry
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={20} color={Colors.inkSoft} />
            </TouchableOpacity>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={[
                styles.presetChip,
                viewYear === currentYear && activeMonth === currentMonth && styles.presetChipActive,
              ]}
              onPress={() => applyPreset(0)}
            >
              <Text
                style={[
                  styles.presetChipText,
                  viewYear === currentYear && activeMonth === currentMonth && styles.presetChipTextActive,
                ]}
              >
                This Month ({MONTHS_SHORT[currentMonth - 1]})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.presetChip,
                viewYear === lastMonthYear && activeMonth === lastMonthNum && styles.presetChipActive,
              ]}
              onPress={() => applyPreset(1)}
            >
              <Text
                style={[
                  styles.presetChipText,
                  viewYear === lastMonthYear && activeMonth === lastMonthNum && styles.presetChipTextActive,
                ]}
              >
                Last Month ({MONTHS_SHORT[lastMonthNum - 1]})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => applyPreset(2)}
            >
              <Text style={styles.presetChipText}>2 Mo. Ago</Text>
            </TouchableOpacity>
          </View>

          {/* Year Selector Bar */}
          <View style={styles.yearNavigator}>
            <TouchableOpacity
              onPress={handlePrevYear}
              style={styles.yearNavBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft size={20} color={Colors.ink} />
            </TouchableOpacity>

            <Text style={styles.yearTitle}>{viewYear}</Text>

            <TouchableOpacity
              onPress={handleNextYear}
              style={[styles.yearNavBtn, !canGoNextYear && styles.navBtnDisabled]}
              disabled={!canGoNextYear}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronRight
                size={20}
                color={canGoNextYear ? Colors.ink : Colors.line}
              />
            </TouchableOpacity>
          </View>

          {/* 12-Month Grid */}
          <View style={styles.monthGrid}>
            {MONTHS_SHORT.map((name, index) => {
              const monthNum = index + 1;
              const isSelected = viewYear === (selectedYear || currentYear) && monthNum === activeMonth;
              const isCurrent = viewYear === currentYear && monthNum === currentMonth;
              const isFuture = viewYear === currentYear && monthNum > currentMonth;

              return (
                <AnimatedPressable
                  key={name}
                  style={[
                    styles.monthCell,
                    isSelected && styles.monthCellSelected,
                    isFuture && styles.monthCellDisabled,
                  ]}
                  disabled={isFuture}
                  onPress={() => handleMonthPress(index)}
                >
                  <Text
                    style={[
                      styles.monthCellText,
                      isSelected && styles.monthCellTextSelected,
                      isFuture && styles.monthCellTextDisabled,
                    ]}
                  >
                    {name}
                  </Text>
                  {isCurrent && !isSelected && (
                    <View style={styles.currentDot} />
                  )}
                  {isSelected && (
                    <Check size={13} color="#FFFFFF" style={styles.checkIcon} />
                  )}
                </AnimatedPressable>
              );
            })}
          </View>

          {/* Footer Note */}
          <View style={styles.footerNote}>
            <Text style={styles.footerText}>
              💡 Expense will be recorded as a single lump sum for{' '}
              <Text style={{ fontWeight: '700', color: Colors.ink }}>
                {formatMonthLabel(viewYear, activeMonth)}
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.cardElevated,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.mossLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.mist,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.mist,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetChipActive: {
    backgroundColor: Colors.mossLight,
    borderColor: Colors.moss,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.inkSoft,
  },
  presetChipTextActive: {
    color: Colors.moss,
    fontWeight: '700',
  },
  yearNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.mist,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  yearNavBtn: {
    padding: 6,
    borderRadius: 8,
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  yearTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.ink,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  monthCell: {
    width: '30%',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  monthCellSelected: {
    backgroundColor: Colors.moss,
    borderColor: Colors.mossDark,
  },
  monthCellDisabled: {
    opacity: 0.3,
    backgroundColor: '#F3F4F3',
  },
  monthCellText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  monthCellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  monthCellTextDisabled: {
    color: Colors.inkSoft,
  },
  currentDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.moss,
    position: 'absolute',
    bottom: 6,
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  footerNote: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  footerText: {
    fontSize: 12,
    color: Colors.inkSoft,
    textAlign: 'center',
  },
});
