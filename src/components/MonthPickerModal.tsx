import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { AnimatedPressable } from './AnimatedPressable';
import { styles } from './MonthPickerModal.styles';

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

