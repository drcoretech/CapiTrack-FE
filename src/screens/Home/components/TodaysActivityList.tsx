import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation } from '../../../i18n/translations';
import { AnimatedPressable } from '../../../components/AnimatedPressable';
import { Expense } from '../../../types';

interface TodaysActivityListProps {
  expenses: Expense[];
  onPressExpense: (expense: Expense) => void;
  onPressEmptyCard: () => void;
  onPressViewAll: () => void;
}

export const TodaysActivityList: React.FC<TodaysActivityListProps> = ({
  expenses,
  onPressExpense,
  onPressEmptyCard,
  onPressViewAll,
}) => {
  const { t, getCategoryName } = useTranslation();

  return (
    <View style={styles.recentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('todaysActivity')} ({expenses.length})</Text>
        <AnimatedPressable scaleTo={0.9} onPress={onPressViewAll}>
          <Text style={styles.seeAllText}>{t('viewAll')}</Text>
        </AnimatedPressable>
      </View>

      {expenses.length === 0 ? (
        <AnimatedPressable
          scaleTo={0.97}
          onPress={onPressEmptyCard}
          style={styles.emptyCard}
        >
          <Text style={styles.emptyText}>{t('noExpensesToday')}</Text>
        </AnimatedPressable>
      ) : (
        expenses.map((exp) => (
          <TouchableOpacity
            key={exp.id}
            activeOpacity={0.75}
            onPress={() => onPressExpense(exp)}
            style={styles.expItem}
          >
            <View style={styles.expLeft}>
              <View style={styles.expIconContainer}>
                <Text style={styles.expIcon}>{exp.icon}</Text>
              </View>
              <View style={styles.expDetails}>
                <Text style={styles.expName} numberOfLines={1} ellipsizeMode="tail">
                  {exp.note}
                </Text>
                <Text style={styles.expMeta} numberOfLines={1} ellipsizeMode="tail">
                  {getCategoryName(exp.category)} · {exp.time}
                </Text>
              </View>
            </View>
            <Text style={styles.expAmount}>₹{exp.amount.toLocaleString()}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  recentSection: {
    marginTop: 4,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: Colors.inkSoft,
  },
  seeAllText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.moss,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.line,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12.5,
    color: Colors.inkSoft,
    textAlign: 'center',
  },
  expItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    padding: 12,
  },
  expLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  expDetails: {
    flex: 1,
  },
  expIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  expIcon: {
    fontSize: 18,
  },
  expName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  expMeta: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  expAmount: {
    fontFamily: Fonts.serifMedium,
    fontSize: 15,
    color: Colors.ink,
    flexShrink: 0,
    textAlign: 'right',
  },
});
