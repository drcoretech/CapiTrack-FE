import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
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
  onPrevYear,
  onNextYear,
  onSelectMonth,
}) => {
  const { t, getMonth } = useTranslation();
  const monthPillList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const handleArrowLeft = () => {
    if (onPrevYear) onPrevYear();
    else if (onPrevMonth) onPrevMonth();
  };

  const handleArrowRight = () => {
    if (onNextYear) onNextYear();
    else if (onNextMonth) onNextMonth();
  };

  return (
    <View style={styles.monthNavCard}>
      <View style={styles.monthNavRow}>
        <AnimatedPressable style={styles.chevronBtn} onPress={handleArrowLeft}>
          <ChevronLeft size={20} color={Colors.ink} />
        </AnimatedPressable>

        <View style={styles.monthCenterDisplay}>
          <Text style={styles.monthDisplayTitle}>
            {getMonth(selectedMonth, 'long')} {selectedYear}
          </Text>
          {isCurrentMonth && (
            <View style={styles.currentMonthBadge}>
              <Text style={styles.currentMonthBadgeText}>
                {t('currentMonthBadge')}
              </Text>
            </View>
          )}
        </View>

        <AnimatedPressable style={styles.chevronBtn} onPress={handleArrowRight}>
          <ChevronRight size={20} color={Colors.ink} />
        </AnimatedPressable>
      </View>

      {/* Horizontal Month Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthPillsContainer}
      >
        {monthPillList.map((m) => {
          const isSelected = m === selectedMonth;
          return (
            <AnimatedPressable
              key={m}
              style={[styles.monthPill, isSelected && styles.monthPillActive]}
              onPress={() => onSelectMonth(m, selectedYear)}
            >
              <Text
                style={[
                  styles.monthPillText,
                  isSelected && styles.monthPillTextActive,
                ]}
              >
                {getMonth(m, 'short')}
              </Text>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
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
    paddingHorizontal: 12,
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
  monthPillText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  monthPillTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.sansSemiBold,
  },
});
