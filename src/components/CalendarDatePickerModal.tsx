import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { AnimatedPressable } from './AnimatedPressable';

interface CalendarDatePickerModalProps {
  visible: boolean;
  selectedDateStr?: string; // YYYY-MM-DD or ISO string
  onSelectDate: (dateStr: string, formattedLabel: string) => void;
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

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function formatHumanDate(dateStr?: string): string {
  if (!dateStr) return 'Select date';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 0 && m < 12) {
      return `${d} ${MONTHS_SHORT[m]} ${y}`;
    }
  }
  return dateStr;
}

export const CalendarDatePickerModal: React.FC<CalendarDatePickerModalProps> = ({
  visible,
  selectedDateStr,
  onSelectDate,
  onClose,
}) => {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  // Initial year & month from selectedDateStr or today
  const parseInitial = () => {
    if (selectedDateStr) {
      const parts = selectedDateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          return { year: y, month: m, day: d };
        }
      }
    }
    return { year: todayYear, month: todayMonth, day: todayDate };
  };

  const initial = parseInitial();
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [selectedDay, setSelectedDay] = useState(initial.day);
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);

  useEffect(() => {
    if (visible) {
      const init = parseInitial();
      setViewYear(init.year);
      setViewMonth(init.month);
      setSelectedYear(init.year);
      setSelectedMonth(init.month);
      setSelectedDay(init.day);
    }
  }, [visible, selectedDateStr]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    // Prevent navigating past next month if it is in future
    const isCurrentOrFutureMonth =
      viewYear > todayYear || (viewYear === todayYear && viewMonth >= todayMonth);
    if (isCurrentOrFutureMonth) return;

    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isNextDisabled =
    viewYear > todayYear || (viewYear === todayYear && viewMonth >= todayMonth);

  // Month grid calculations
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleSelectDay = (day: number) => {
    // Check if future day
    if (
      viewYear > todayYear ||
      (viewYear === todayYear && viewMonth > todayMonth) ||
      (viewYear === todayYear && viewMonth === todayMonth && day > todayDate)
    ) {
      return; // Disabled future date
    }

    setSelectedYear(viewYear);
    setSelectedMonth(viewMonth);
    setSelectedDay(day);

    const formattedIso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const label = `${day} ${MONTHS_SHORT[viewMonth]} ${viewYear}`;
    onSelectDate(formattedIso, label);
    onClose();
  };

  const handleQuickPreset = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() - offsetDays);
    const y = target.getFullYear();
    const m = target.getMonth();
    const d = target.getDate();

    setViewYear(y);
    setViewMonth(m);
    setSelectedYear(y);
    setSelectedMonth(m);
    setSelectedDay(d);

    const formattedIso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const label = offsetDays === 0 ? 'Today' : offsetDays === 1 ? 'Yesterday' : `${d} ${MONTHS_SHORT[m]} ${y}`;
    onSelectDate(formattedIso, label);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <CalendarIcon size={20} color={Colors.moss} style={{ marginRight: 8 }} />
              <Text style={styles.headerTitle}>Select Date</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color={Colors.inkSoft} />
            </TouchableOpacity>
          </View>

          {/* Quick Presets Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetsRow}
          >
            <TouchableOpacity
              onPress={() => handleQuickPreset(0)}
              style={[
                styles.presetChip,
                selectedYear === todayYear &&
                  selectedMonth === todayMonth &&
                  selectedDay === todayDate &&
                  styles.presetChipActive,
              ]}
            >
              <Text
                style={[
                  styles.presetText,
                  selectedYear === todayYear &&
                    selectedMonth === todayMonth &&
                    selectedDay === todayDate &&
                    styles.presetTextActive,
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickPreset(1)}
              style={styles.presetChip}
            >
              <Text style={styles.presetText}>Yesterday</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickPreset(2)}
              style={styles.presetChip}
            >
              <Text style={styles.presetText}>2 days ago</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickPreset(3)}
              style={styles.presetChip}
            >
              <Text style={styles.presetText}>3 days ago</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickPreset(7)}
              style={styles.presetChip}
            >
              <Text style={styles.presetText}>1 week ago</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Month & Year Navigation Bar */}
          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={handlePrevMonth}
              style={styles.navArrow}
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color={Colors.ink} />
            </TouchableOpacity>

            <Text style={styles.monthTitle}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>

            <TouchableOpacity
              onPress={handleNextMonth}
              style={[styles.navArrow, isNextDisabled && styles.navArrowDisabled]}
              disabled={isNextDisabled}
              activeOpacity={0.7}
            >
              <ChevronRight
                size={20}
                color={isNextDisabled ? Colors.line : Colors.ink}
              />
            </TouchableOpacity>
          </View>

          {/* Weekday Headers */}
          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map((wd, i) => (
              <Text key={i} style={styles.weekdayLabel}>
                {wd}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.dayCellEmpty} />
            ))}

            {/* Month Days */}
            {Array.from({ length: totalDaysInMonth }).map((_, index) => {
              const day = index + 1;
              const isToday =
                viewYear === todayYear && viewMonth === todayMonth && day === todayDate;
              const isSelected =
                viewYear === selectedYear &&
                viewMonth === selectedMonth &&
                day === selectedDay;
              const isFuture =
                viewYear > todayYear ||
                (viewYear === todayYear && viewMonth > todayMonth) ||
                (viewYear === todayYear && viewMonth === todayMonth && day > todayDate);

              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  onPress={() => handleSelectDay(day)}
                  disabled={isFuture}
                  style={[
                    styles.dayCell,
                    isToday && !isSelected && styles.dayCellToday,
                    isSelected && styles.dayCellSelected,
                    isFuture && styles.dayCellFuture,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isToday && !isSelected && styles.dayTextToday,
                      isSelected && styles.dayTextSelected,
                      isFuture && styles.dayTextFuture,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Confirmation summary */}
          <View style={styles.modalFooter}>
            <Text style={styles.selectedLabel}>
              Selected: <Text style={styles.selectedDateHighlight}>{selectedDay} {MONTHS_SHORT[selectedMonth]} {selectedYear}</Text>
            </Text>
            <AnimatedPressable
              scaleTo={0.96}
              onPress={() => {
                const formattedIso = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
                const label = `${selectedDay} ${MONTHS_SHORT[selectedMonth]} ${selectedYear}`;
                onSelectDate(formattedIso, label);
                onClose();
              }}
              style={styles.confirmBtn}
            >
              <Check size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.confirmBtnText}>Apply Date</Text>
            </AnimatedPressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 18, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 19,
    color: Colors.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    marginBottom: 12,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.mist,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  presetChipActive: {
    backgroundColor: Colors.mossLight,
    borderColor: Colors.moss,
  },
  presetText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  presetTextActive: {
    color: Colors.moss,
    fontFamily: Fonts.sansSemiBold,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 16,
    color: Colors.ink,
  },
  navArrow: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowDisabled: {
    opacity: 0.35,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: 40,
    textAlign: 'center',
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.inkSoft,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  dayCellEmpty: {
    width: 40,
    height: 38,
  },
  dayCell: {
    width: 40,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: Colors.moss,
  },
  dayCellSelected: {
    backgroundColor: Colors.moss,
  },
  dayCellFuture: {
    opacity: 0.25,
  },
  dayText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  dayTextToday: {
    color: Colors.moss,
    fontFamily: Fonts.sansBold,
  },
  dayTextSelected: {
    color: '#ffffff',
    fontFamily: Fonts.sansBold,
  },
  dayTextFuture: {
    color: Colors.inkSoft,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  selectedLabel: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  selectedDateHighlight: {
    fontFamily: Fonts.sansSemiBold,
    color: Colors.ink,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.moss,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  confirmBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: '#ffffff',
  },
});
