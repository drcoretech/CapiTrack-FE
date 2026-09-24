import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation } from '../../../i18n/translations';
import { AnimatedPressable } from '../../../components/AnimatedPressable';
import { CategoryIcon } from '../../../components/CategoryIcon';
import { Expense } from '../../../types';
import { Pencil } from 'lucide-react-native';


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
        expenses.map((exp) => {
          const isMonthlyTotal = exp.note?.includes('[Monthly Total]');
          const cleanNote = isMonthlyTotal
            ? exp.note.replace(/\[Monthly Total\]\s*/g, '').trim() || 'Full Month Total'
            : exp.note;

          return (
            <TouchableOpacity
              key={exp.id}
              activeOpacity={0.75}
              onPress={() => onPressExpense(exp)}
              style={styles.expItem}
            >
              <View style={styles.expLeft}>
                <View style={[styles.expIconContainer, isMonthlyTotal && { backgroundColor: Colors.amberLight }]}>
                  <CategoryIcon
                    category={isMonthlyTotal ? 'monthly' : exp.category}
                    icon={exp.icon}
                    size={17}
                    color={isMonthlyTotal ? Colors.amber : Colors.moss}
                  />
                </View>
                <View style={styles.expDetails}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.expName} numberOfLines={1} ellipsizeMode="tail">
                      {cleanNote}
                    </Text>
                    {isMonthlyTotal && (
                      <View style={{ backgroundColor: Colors.amberLight, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5 }}>
                        <Text style={{ fontSize: 8.5, fontWeight: '700', color: Colors.amber }}>LUMP SUM</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.expMeta} numberOfLines={1} ellipsizeMode="tail">
                    {isMonthlyTotal ? 'Full Month Lump Sum' : `${getCategoryName(exp.category)} · ${exp.time}`}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.expAmount}>₹{exp.amount.toLocaleString()}</Text>
                <View style={styles.editPill}>
                  <Pencil size={11} color={Colors.inkSoft} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })
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
  editPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
