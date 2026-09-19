import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation } from '../../../i18n/translations';
import { CategoryIcon } from '../../../components/CategoryIcon';

interface MonthHeroCardProps {
  totalSpent: number;
  currencySymbol: string;
  momDelta: {
    pct: number;
    isIncrease: boolean;
    isDecrease: boolean;
    isZero: boolean;
  } | null;
  dailyAverage: number;
  topCategory: {
    category: string;
    icon: string;
    amount: number;
    count: number;
    percentage: number;
  } | null;
  transactionCount: number;
}

export const MonthHeroCard: React.FC<MonthHeroCardProps> = ({
  totalSpent,
  currencySymbol,
  momDelta,
  dailyAverage,
  topCategory,
  transactionCount,
}) => {
  const { t, getCategoryName } = useTranslation();

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroTopRow}>
        <View>
          <Text style={styles.heroEyebrow}>{t('totalMonthlySpend')}</Text>
          <Text style={styles.heroAmount}>
            {currencySymbol}
            {totalSpent.toLocaleString()}
          </Text>
        </View>

        {/* Month-over-Month Delta Badge */}
        {momDelta ? (
          <View
            style={[
              styles.deltaBadge,
              momDelta.isDecrease
                ? styles.deltaBadgePositive
                : styles.deltaBadgeNegative,
            ]}
          >
            {momDelta.isDecrease ? (
              <TrendingDown size={14} color={Colors.moss} />
            ) : (
              <TrendingUp size={14} color={Colors.brick} />
            )}
            <Text
              style={[
                styles.deltaText,
                momDelta.isDecrease
                  ? styles.deltaTextPositive
                  : styles.deltaTextNegative,
              ]}
            >
              {momDelta.pct}% {t('vsPrevMonth')}
            </Text>
          </View>
        ) : (
          <View style={styles.deltaBadgeNeutral}>
            <Text style={styles.deltaTextNeutral}>{t('baselineLabel')}</Text>
          </View>
        )}
      </View>

      <View style={styles.heroDivider} />

      {/* Quick Metrics Row */}
      <View style={styles.quickStatsRow}>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>{t('dailyAvg')}</Text>
          <Text style={styles.statValue}>
            {currencySymbol}
            {dailyAverage.toLocaleString()}
            <Text style={styles.statSubText}>{t('perDay')}</Text>
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCol}>
          <Text style={styles.statLabel}>{t('topCategoryLabel')}</Text>
          {topCategory ? (
            <View style={styles.topCatPill}>
              <CategoryIcon
                category={topCategory.category}
                icon={topCategory.icon}
                size={14}
                color={Colors.moss}
              />
              <Text style={styles.topCatName} numberOfLines={1}>
                {getCategoryName(topCategory.category)}
              </Text>
            </View>
          ) : (
            <Text style={styles.statEmptyText}>None</Text>
          )}
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCol}>
          <Text style={styles.statLabel}>{t('monthTransactions')}</Text>
          <Text style={styles.statValue}>
            {transactionCount}{' '}
            <Text style={styles.statSubText}>
              {t('monthTransactions')}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#F7FAF7',
    borderWidth: 1.5,
    borderColor: Colors.moss,
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroEyebrow: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  heroAmount: {
    fontFamily: Fonts.serifMedium,
    fontSize: 32,
    color: Colors.ink,
    marginTop: 4,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  deltaBadgePositive: {
    backgroundColor: Colors.mossLight,
  },
  deltaBadgeNegative: {
    backgroundColor: Colors.brickLight,
  },
  deltaBadgeNeutral: {
    backgroundColor: Colors.mist,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  deltaText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
  },
  deltaTextPositive: {
    color: Colors.mossDark,
  },
  deltaTextNegative: {
    color: Colors.brick,
  },
  deltaTextNeutral: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.inkSoft,
  },
  heroDivider: {
    height: 1,
    backgroundColor: Colors.line,
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.line,
    marginHorizontal: 8,
  },
  statLabel: {
    fontFamily: Fonts.monoRegular,
    fontSize: 9.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: Colors.ink,
  },
  statSubText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
  },
  statEmptyText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  topCatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  topCatIcon: {
    fontSize: 11,
  },
  topCatName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11.5,
    color: Colors.ink,
  },
});
