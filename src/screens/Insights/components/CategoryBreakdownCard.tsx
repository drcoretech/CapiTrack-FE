import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation } from '../../../i18n/translations';

interface CategoryItem {
  category: string;
  icon: string;
  amount: number;
  count: number;
  percentage: number;
}

interface CategoryBreakdownCardProps {
  categoryBreakdown: CategoryItem[];
  currencySymbol: string;
  getCategoryColor: (index: number) => string;
}

export const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({
  categoryBreakdown,
  currencySymbol,
  getCategoryColor,
}) => {
  const { t, getCategoryName } = useTranslation();

  return (
    <View style={styles.breakdownCard}>
      <View style={styles.breakdownHeaderRow}>
        <Text style={styles.breakdownHeader}>{t('spendBreakdown')}</Text>
        <Text style={styles.breakdownCountText}>
          {categoryBreakdown.length} {t('activeTag')}
        </Text>
      </View>

      {categoryBreakdown.length > 0 ? (
        categoryBreakdown.map((item, index) => {
          const catColor = getCategoryColor(index);
          const isTop = index === 0;

          return (
            <View key={item.category} style={styles.catBreakdownItem}>
              {/* Top line with Icon, Name, Amount and Percentage */}
              <View style={styles.catRow}>
                <View style={styles.catLeft}>
                  <Text style={styles.catEmoji}>{item.icon}</Text>
                  <Text style={styles.catName}>
                    {getCategoryName(item.category)}
                  </Text>
                  {isTop && (
                    <View style={styles.topBadge}>
                      <Text style={styles.topBadgeText}>
                        {t('topCategoryLabel')}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.catRight}>
                  <Text style={styles.catAmount}>
                    {currencySymbol}
                    {item.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.catPctText}>{item.percentage}%</Text>
                </View>
              </View>

              {/* Visual Progress Bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: catColor,
                    },
                  ]}
                />
              </View>

              {/* Transaction count */}
              <Text style={styles.catTxnCount}>
                {item.count}{' '}
                {item.count === 1 ? 'transaction' : t('monthTransactions')}
              </Text>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyCatContainer}>
          <Text style={styles.emptyCatText}>
            {t('noExpensesThisMonth')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  breakdownCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 20,
    padding: 16,
    gap: 14,
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
  catBreakdownItem: {
    gap: 6,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    paddingBottom: 10,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catEmoji: {
    fontSize: 16,
  },
  catName: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  topBadge: {
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  topBadgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9,
    color: Colors.ink,
  },
  catRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  catAmount: {
    fontFamily: Fonts.monoMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  catPctText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    color: Colors.inkSoft,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.mist,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  catTxnCount: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10,
    color: Colors.inkSoft,
  },
  emptyCatContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyCatText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
  },
});
