import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, Plus } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation } from '../../../i18n/translations';
import { AnimatedPressable } from '../../../components/AnimatedPressable';
import { Expense } from '../../../types';
import { CategoryIcon } from '../../../components/CategoryIcon';

interface MonthActivityLogProps {
  monthExpenses: Expense[];
  currencySymbol: string;
  onPressAddExpense?: () => void;
}

export const MonthActivityLog: React.FC<MonthActivityLogProps> = ({
  monthExpenses,
  currencySymbol,
}) => {
  const { t, getCategoryName } = useTranslation();

  return (
    <View style={styles.activityCard}>
      <View style={styles.breakdownHeaderRow}>
        <Text style={styles.breakdownHeader}>{t('monthActivity')}</Text>
        <Text style={styles.breakdownCountText}>
          {monthExpenses.length} {t('monthTransactions')}
        </Text>
      </View>

      {monthExpenses.length > 0 ? (
        monthExpenses.map((expense) => {
          const isMonthlyTotal = expense.note?.includes('[Monthly Total]');
          const cleanTitle = isMonthlyTotal
            ? expense.note?.replace(/\[Monthly Total\]\s*/g, '').trim() || 'Full Month Total'
            : expense.note || getCategoryName(expense.category);

          const transactionDate = new Date(expense.date || expense.createdAt);
          const dateLabel = isMonthlyTotal
            ? 'Monthly Lump Sum'
            : transactionDate.toLocaleDateString([], {
                day: 'numeric',
                month: 'short',
              });

          return (
            <View key={expense.id} style={styles.activityItem}>
              <View style={styles.activityLeft}>
                <View
                  style={[
                    styles.activityIconCircle,
                    isMonthlyTotal && styles.activityIconCircleLumpSum,
                  ]}
                >
                  <CategoryIcon
                    category={isMonthlyTotal ? 'monthly' : expense.category}
                    icon={expense.icon}
                    size={17}
                    color={isMonthlyTotal ? Colors.amber : Colors.moss}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.activityTitle} numberOfLines={1}>
                      {cleanTitle}
                    </Text>
                    {isMonthlyTotal && (
                      <View style={styles.lumpSumPill}>
                        <Text style={styles.lumpSumPillText}>Lump Sum</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.activitySubtitle}>
                    {dateLabel} · {isMonthlyTotal ? 'Manual Record' : (expense.time || '12:00pm')}
                  </Text>
                </View>
              </View>
              <Text style={styles.activityAmount}>
                - {currencySymbol}
                {expense.amount.toLocaleString()}
              </Text>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyActivityContainer}>
          <View style={styles.emptyIconCircle}>
            <Calendar size={24} color={Colors.inkSoft} />
          </View>
          <Text style={styles.emptyTitle}>
            {t('noExpensesThisMonth')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  activityCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  breakdownHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownHeader: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  breakdownCountText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10,
    color: Colors.inkSoft,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.mist,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconCircleLumpSum: {
    backgroundColor: Colors.amberLight,
  },
  activityIcon: {
    fontSize: 16,
  },
  activityTitle: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13.5,
    color: Colors.ink,
    flexShrink: 1,
  },
  lumpSumPill: {
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  lumpSumPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.amber,
    textTransform: 'uppercase',
  },
  activitySubtitle: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  activityAmount: {
    fontFamily: Fonts.monoMedium,
    fontSize: 13.5,
    color: Colors.brick,
    flexShrink: 0,
    textAlign: 'right',
  },
  emptyActivityContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.mist,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.inkSoft,
    textAlign: 'center',
  },
  addExpenseActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.moss,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    marginTop: 4,
  },
  addExpenseActionText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
});
