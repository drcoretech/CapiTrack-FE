import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation } from '../../../i18n/translations';
import { AnimatedPressable } from '../../../components/AnimatedPressable';
import { CategoryIcon } from '../../../components/CategoryIcon';
import { Expense } from '../../../types';
import { Plus, Coffee, ChevronRight } from 'lucide-react-native';

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
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>{t('todaysActivity')}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{expenses.length}</Text>
          </View>
        </View>
        <AnimatedPressable scaleTo={0.92} onPress={onPressViewAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <View style={styles.seeAllWrap}>
            <Text style={styles.seeAllText}>{t('viewAll')}</Text>
            <ChevronRight size={12} color={Colors.moss} strokeWidth={2.2} />
          </View>
        </AnimatedPressable>
      </View>

      {expenses.length === 0 ? (
        <AnimatedPressable
          scaleTo={0.98}
          onPress={onPressEmptyCard}
          style={styles.emptyCard}
        >
          <View style={styles.emptyIconCircle}>
            <Coffee size={20} color={Colors.moss} strokeWidth={1.8} />
          </View>
          <View style={styles.emptyTextCol}>
            <Text style={styles.emptyTitle}>Nothing spent yet today</Text>
            <Text style={styles.emptySubtitle}>Tap here to log your morning chai, transit, or groceries</Text>
          </View>
          <View style={styles.emptyAddBtn}>
            <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </AnimatedPressable>
      ) : (
        <View style={styles.itemsWrapper}>
          {expenses.map((exp) => {
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
                      size={18}
                      color={isMonthlyTotal ? Colors.amber : Colors.moss}
                    />
                  </View>
                  <View style={styles.expDetails}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.expName} numberOfLines={1} ellipsizeMode="tail">
                        {cleanNote}
                      </Text>
                      {isMonthlyTotal && (
                        <View style={styles.lumpSumBadge}>
                          <Text style={styles.lumpSumText}>LUMP SUM</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.expMeta} numberOfLines={1} ellipsizeMode="tail">
                      {isMonthlyTotal ? 'Full Month Lump Sum' : `${getCategoryName(exp.category)}${exp.time ? ` · ${exp.time}` : ''}`}
                    </Text>
                  </View>
                </View>
                <View style={styles.expRight}>
                  <Text style={styles.expAmount}>₹{exp.amount.toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  recentSection: {
    marginTop: 2,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 0.8,
    color: Colors.inkSoft,
    textTransform: 'uppercase',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    backgroundColor: Colors.mist,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  countBadgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    color: Colors.inkSoft,
  },
  seeAllWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.moss,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.line,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  emptyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTextCol: {
    flex: 1,
    gap: 2,
  },
  emptyTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  emptySubtitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    lineHeight: 15,
  },
  emptyAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsWrapper: {
    gap: 9,
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
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  expLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 10,
  },
  expDetails: {
    flex: 1,
  },
  expIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  expName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: Colors.ink,
  },
  lumpSumBadge: {
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
  },
  lumpSumText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: Colors.amber,
  },
  expMeta: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  expRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expAmount: {
    fontFamily: Fonts.serifMedium,
    fontSize: 15.5,
    color: Colors.ink,
    flexShrink: 0,
    textAlign: 'right',
  },
});
