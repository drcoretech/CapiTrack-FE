import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, Calendar } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation } from '../../../i18n/translations';
import { Expense } from '../../../types';

interface SpentTodayCardProps {
  spentToday: number;
  deltaText: string;
  allExpenses?: Expense[];
}

export const SpentTodayCard: React.FC<SpentTodayCardProps> = ({
  spentToday,
  deltaText,
  allExpenses = [],
}) => {
  const { t } = useTranslation();

  // 7-day spending rhythm data computation
  const rhythmData = useMemo(() => {
    const days: { label: string; amount: number; isToday: boolean }[] = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayName = dayNames[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];

      // Match expenses on this date
      const daySum = allExpenses
        .filter((e) => {
          if (e.date && e.date.startsWith(dateStr)) return true;
          if (e.createdAt && e.createdAt.startsWith(dateStr)) return true;
          if (i === 0 && e.dayGroup === 'Today') return true;
          if (i === 1 && e.dayGroup === 'Yesterday') return true;
          return false;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      days.push({
        label: dayName,
        amount: daySum,
        isToday: i === 0,
      });
    }

    const maxAmt = Math.max(...days.map((d) => d.amount), 1);
    return { days, maxAmt };
  }, [allExpenses, spentToday]);

  const monthTotal = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return allExpenses
      .filter((e) => {
        const d = e.createdAt ? new Date(e.createdAt) : new Date();
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [allExpenses]);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.statLabel}>{t('spentToday')}</Text>
          <Text style={styles.statNum}>₹{spentToday.toLocaleString()}</Text>
          <View style={styles.deltaBadge}>
            <TrendingUp size={11} color={spentToday > 0 ? Colors.moss : Colors.inkSoft} style={{ marginRight: 4 }} />
            <Text style={[styles.statDelta, spentToday > 0 && { color: Colors.moss }]}>
              {deltaText}
            </Text>
          </View>
        </View>

        {/* 7-Day Spending Rhythm Spark Bars */}
        <View style={styles.rhythmContainer}>
          <Text style={styles.rhythmHeader}>7-DAY SPEND</Text>
          <View style={styles.barsRow}>
            {rhythmData.days.map((day, idx) => {
              const heightRatio = Math.max(day.amount / rhythmData.maxAmt, 0.12);
              const barHeight = Math.round(heightRatio * 32);
              const isPeak = day.amount === rhythmData.maxAmt && day.amount > 0;

              return (
                <View key={idx} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: barHeight },
                        day.isToday && styles.barFillToday,
                        isPeak && styles.barFillPeak,
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      day.isToday && styles.barLabelToday,
                    ]}
                  >
                    {day.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Month Subtotal Footnote */}
      {monthTotal > 0 && (
        <View style={styles.monthFootnote}>
          <Calendar size={11} color={Colors.inkSoft} style={{ marginRight: 5 }} />
          <Text style={styles.monthFootnoteText}>
            Month-to-date:{' '}
            <Text style={styles.monthFootnoteBold}>₹{monthTotal.toLocaleString()}</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 16,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  statNum: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 38,
    color: Colors.ink,
    lineHeight: 44,
    marginTop: 3,
    letterSpacing: -0.5,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(31, 42, 36, 0.04)',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statDelta: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
  },
  rhythmContainer: {
    alignItems: 'flex-end',
    paddingTop: 2,
  },
  rhythmHeader: {
    fontFamily: Fonts.monoMedium,
    fontSize: 8.5,
    letterSpacing: 1,
    color: Colors.inkSoft,
    marginBottom: 6,
  },
  barsRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'flex-end',
    height: 44,
  },
  barCol: {
    alignItems: 'center',
    width: 14,
  },
  barTrack: {
    height: 32,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: 6,
    borderRadius: 3,
    backgroundColor: '#D1DDD6',
  },
  barFillToday: {
    backgroundColor: Colors.moss,
  },
  barFillPeak: {
    backgroundColor: Colors.amber,
  },
  barLabel: {
    fontFamily: Fonts.monoRegular,
    fontSize: 8,
    color: Colors.inkSoft,
    marginTop: 4,
  },
  barLabelToday: {
    color: Colors.moss,
    fontWeight: '700',
  },
  monthFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    marginTop: 12,
    paddingTop: 10,
  },
  monthFootnoteText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    color: Colors.inkSoft,
  },
  monthFootnoteBold: {
    fontFamily: Fonts.monoMedium,
    color: Colors.ink,
    fontWeight: '600',
  },
});
