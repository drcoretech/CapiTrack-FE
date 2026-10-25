import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  X,
  Check,
} from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation } from '../../../i18n/translations';
import { AnimatedPressable } from '../../../components/AnimatedPressable';

interface MonthSelectorBarProps {
  selectedMonth: number;
  selectedYear: number;
  isCurrentMonth: boolean;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onPrevYear?: () => void;
  onNextYear?: () => void;
  onSelectMonth: (month: number, year: number) => void;
}

export const MonthSelectorBar: React.FC<MonthSelectorBarProps> = ({
  selectedMonth,
  selectedYear,
  isCurrentMonth,
  onPrevMonth,
  onNextMonth,
  onSelectMonth,
}) => {
  const { t, getMonth } = useTranslation();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [modalYear, setModalYear] = useState(selectedYear);

  const scrollRef = useRef<ScrollView>(null);
  const today = new Date();
  const currentCalMonth = today.getMonth() + 1;
  const currentCalYear = today.getFullYear();

  const monthPillList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Keep modal year in sync with selected year when opened
  useEffect(() => {
    if (pickerVisible) {
      setModalYear(selectedYear);
    }
  }, [pickerVisible, selectedYear]);

  // Auto-scroll horizontal pill bar when selectedMonth changes
  useEffect(() => {
    if (scrollRef.current) {
      const pillWidth = 52;
      const targetOffset = Math.max(0, (selectedMonth - 2) * pillWidth);
      scrollRef.current.scrollTo({ x: targetOffset, animated: true });
    }
  }, [selectedMonth]);

  // Navigate month-by-month
  const handleArrowLeft = () => {
    if (onPrevMonth) {
      onPrevMonth();
    } else {
      if (selectedMonth === 1) {
        onSelectMonth(12, selectedYear - 1);
      } else {
        onSelectMonth(selectedMonth - 1, selectedYear);
      }
    }
  };

  const handleArrowRight = () => {
    if (onNextMonth) {
      onNextMonth();
    } else {
      if (selectedMonth === 12) {
        onSelectMonth(1, selectedYear + 1);
      } else {
        onSelectMonth(selectedMonth + 1, selectedYear);
      }
    }
  };

  const handleSelectFromModal = (m: number) => {
    onSelectMonth(m, modalYear);
    setPickerVisible(false);
  };

  const handleJumpToCurrentMonth = () => {
    onSelectMonth(currentCalMonth, currentCalYear);
    setPickerVisible(false);
  };

  return (
    <View style={styles.monthNavCard}>
      {/* Top Navigation Row: Chevrons navigate month-by-month */}
      <View style={styles.monthNavRow}>
        <AnimatedPressable
          style={styles.chevronBtn}
          onPress={handleArrowLeft}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={20} color={Colors.ink} />
        </AnimatedPressable>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPickerVisible(true)}
          style={styles.monthCenterDisplay}
        >
          <View style={styles.titleRow}>
            <Text style={styles.monthDisplayTitle}>
              {getMonth(selectedMonth, 'long')} {selectedYear}
            </Text>
            <ChevronDown size={16} color={Colors.inkSoft} style={{ marginTop: 1 }} />
          </View>

          {isCurrentMonth && (
            <View style={styles.currentMonthBadge}>
              <Text style={styles.currentMonthBadgeText}>
                {t('currentMonthBadge')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <AnimatedPressable
          style={styles.chevronBtn}
          onPress={handleArrowRight}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronRight size={20} color={Colors.ink} />
        </AnimatedPressable>
      </View>

      {/* Horizontal Month Pills */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthPillsContainer}
      >
        {monthPillList.map((m) => {
          const isSelected = m === selectedMonth;
          const isNow = m === currentCalMonth && selectedYear === currentCalYear;
          return (
            <AnimatedPressable
              key={m}
              style={[
                styles.monthPill,
                isSelected && styles.monthPillActive,
                !isSelected && isNow && styles.monthPillCurrentOutline,
              ]}
              onPress={() => onSelectMonth(m, selectedYear)}
            >
              <Text
                style={[
                  styles.monthPillText,
                  isSelected && styles.monthPillTextActive,
                  !isSelected && isNow && styles.monthPillTextCurrent,
                ]}
              >
                {getMonth(m, 'short')}
              </Text>
            </AnimatedPressable>
          );
        })}
      </ScrollView>

      {/* Enhanced Month & Year Picker Modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPickerVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Calendar size={18} color={Colors.moss} />
                <Text style={styles.modalTitle}>Select Month & Year</Text>
              </View>
              <TouchableOpacity
                onPress={() => setPickerVisible(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color={Colors.inkSoft} />
              </TouchableOpacity>
            </View>

            {/* Year Switcher */}
            <View style={styles.yearSwitcherCard}>
              <TouchableOpacity
                onPress={() => setModalYear((y) => y - 1)}
                style={styles.yearArrowBtn}
                activeOpacity={0.7}
              >
                <ChevronLeft size={20} color={Colors.ink} />
              </TouchableOpacity>

              <View style={styles.yearDisplay}>
                <Text style={styles.yearDisplayText}>{modalYear}</Text>
                {modalYear === currentCalYear && (
                  <View style={styles.yearThisYearBadge}>
                    <Text style={styles.yearThisYearText}>Current Year</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={() => setModalYear((y) => y + 1)}
                style={styles.yearArrowBtn}
                activeOpacity={0.7}
              >
                <ChevronRight size={20} color={Colors.ink} />
              </TouchableOpacity>
            </View>

            {/* 12-Month Grid */}
            <View style={styles.monthGrid}>
              {monthPillList.map((m) => {
                const isSelected = m === selectedMonth && modalYear === selectedYear;
                const isToday = m === currentCalMonth && modalYear === currentCalYear;

                return (
                  <TouchableOpacity
                    key={m}
                    activeOpacity={0.7}
                    onPress={() => handleSelectFromModal(m)}
                    style={[
                      styles.gridMonthItem,
                      isSelected && styles.gridMonthItemActive,
                      !isSelected && isToday && styles.gridMonthItemToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.gridMonthText,
                        isSelected && styles.gridMonthTextActive,
                        !isSelected && isToday && styles.gridMonthTextToday,
                      ]}
                    >
                      {getMonth(m, 'short')}
                    </Text>
                    {isToday && !isSelected && (
                      <View style={styles.todayIndicatorDot} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick Actions Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleJumpToCurrentMonth}
                style={styles.currentMonthBtn}
              >
                <Text style={styles.currentMonthBtnText}>Current Month</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setPickerVisible(false)}
                style={styles.doneBtn}
              >
                <Check size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  monthNavCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chevronBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.mist,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  monthCenterDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthDisplayTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 18,
    color: Colors.ink,
  },
  currentMonthBadge: {
    backgroundColor: Colors.mossLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  currentMonthBadgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9.5,
    color: Colors.mossDark,
    textTransform: 'uppercase',
  },
  monthPillsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 4,
    paddingBottom: 2,
  },
  monthPill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: Colors.mist,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  monthPillActive: {
    backgroundColor: Colors.moss,
    borderColor: Colors.mossDark,
  },
  monthPillCurrentOutline: {
    borderColor: Colors.moss,
  },
  monthPillText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  monthPillTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.sansSemiBold,
  },
  monthPillTextCurrent: {
    color: Colors.moss,
    fontFamily: Fonts.sansSemiBold,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 17,
    color: Colors.ink,
    fontWeight: '700',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearSwitcherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.mist,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  yearArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  yearDisplay: {
    alignItems: 'center',
  },
  yearDisplayText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 18,
    color: Colors.ink,
    fontWeight: '700',
  },
  yearThisYearBadge: {
    backgroundColor: Colors.mossLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginTop: 2,
  },
  yearThisYearText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9,
    color: Colors.mossDark,
    textTransform: 'uppercase',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  gridMonthItem: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    position: 'relative',
  },
  gridMonthItemActive: {
    backgroundColor: Colors.moss,
    borderColor: Colors.mossDark,
  },
  gridMonthItemToday: {
    borderColor: Colors.moss,
  },
  gridMonthText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  gridMonthTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.sansSemiBold,
    fontWeight: '700',
  },
  gridMonthTextToday: {
    color: Colors.mossDark,
    fontFamily: Fonts.sansSemiBold,
  },
  todayIndicatorDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.moss,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingTop: 14,
  },
  currentMonthBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  currentMonthBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  doneBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
